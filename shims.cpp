#include "pxt.h"

// W25Q128 command set
#define CMD_WRITE_ENABLE   0x06
#define CMD_READ_ID        0x9F
#define CMD_PAGE_PROGRAM   0x02
#define CMD_READ_DATA      0x03
#define CMD_SECTOR_ERASE   0x20
#define CMD_READ_STATUS1   0x05

namespace SPIFlash {

static MicroBitPin* csPin = NULL;

// Wait for write/erase to complete
static void waitForReady() {
    uint8_t status;
    do {
        csPin->setDigitalValue(0);
        uBit.spi.write(CMD_READ_STATUS1);
        status = uBit.spi.write(0x00);
        csPin->setDigitalValue(1);
    } while (status & 0x01); // WIP bit
}

//% 
void init(int pin) {
    csPin = getPin(pin);
    csPin->setDigitalValue(1);

    uBit.spi.setFrequency(1000000); // 1 MHz
    uBit.spi.setMode(0);
}

//% 
int readJedecID() {
    csPin->setDigitalValue(0);
    uBit.spi.write(CMD_READ_ID);
    int mfg = uBit.spi.write(0x00);
    int memType = uBit.spi.write(0x00);
    int capacity = uBit.spi.write(0x00);
    csPin->setDigitalValue(1);

    return (mfg << 16) | (memType << 8) | capacity;
}

//%
void writeByte(uint32_t address, uint8_t data) {
    // Enable write
    csPin->setDigitalValue(0);
    uBit.spi.write(CMD_WRITE_ENABLE);
    csPin->setDigitalValue(1);

    // Page program
    csPin->setDigitalValue(0);
    uint8_t cmd[4] = {CMD_PAGE_PROGRAM,
                      (uint8_t)(address >> 16),
                      (uint8_t)(address >> 8),
                      (uint8_t)(address)};
    uBit.spi.write(cmd, 4);
    uBit.spi.write(data);
    csPin->setDigitalValue(1);

    waitForReady();
}

//%
int readByte(uint32_t address) {
    csPin->setDigitalValue(0);
    uint8_t cmd[4] = {CMD_READ_DATA,
                      (uint8_t)(address >> 16),
                      (uint8_t)(address >> 8),
                      (uint8_t)(address)};
    uBit.spi.write(cmd, 4);
    int value = uBit.spi.write(0x00);
    csPin->setDigitalValue(1);
    return value;
}

//%
void eraseSector(uint32_t address) {
    // Enable write
    csPin->setDigitalValue(0);
    uBit.spi.write(CMD_WRITE_ENABLE);
    csPin->setDigitalValue(1);

    csPin->setDigitalValue(0);
    uint8_t cmd[4] = {CMD_SECTOR_ERASE,
                      (uint8_t)(address >> 16),
                      (uint8_t)(address >> 8),
                      (uint8_t)(address)};
    uBit.spi.write(cmd, 4);
    csPin->setDigitalValue(1);

    waitForReady();
}
}

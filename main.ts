/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="\uf0c7"
namespace w25q128 {
  let CS = DigitalPin.P16;

  function toHex(n: number): string {
    const hexChars = "0123456789abcdef";
    let hi = Math.idiv(n, 16);
    let lo = n % 16;
    return hexChars.charAt(hi) + hexChars.charAt(lo);
  }

  function sendSpiCommand(command: number): void {
    pins.digitalWritePin(CS, 0); // Select the chip
    pins.spiWrite(command); // Send command
    pins.digitalWritePin(CS, 1); // Deselect the chip
  }

  /**
   */
  //% block
  export function deepPowerDown(): void {
    let CMD_DEEP_POWER_DOWN = 0xb9;
    sendSpiCommand(CMD_DEEP_POWER_DOWN);
  }

  /**
   */
  //% block
  export function releasePowerDown(): void {
    let CMD_RELEASE_POWER_DOWN = 0xab;
    sendSpiCommand(CMD_RELEASE_POWER_DOWN);
    control.waitMicros(3); // minimum 3 µs required
  }

  /**
   */
  //% block
  export function setupSpiFlash(
    mosi: DigitalPin,
    miso: DigitalPin,
    sck: DigitalPin,
    cs: DigitalPin
  ): void {
    // Setup SPI pins
    //MOSI = P15, MISO = P14, SCK = P13
    //pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
    pins.spiPins(mosi, miso, sck);
    pins.spiFormat(8, 0); // 8-bit data, mode 0 (CPOL=0, CPHA=0)
    pins.spiFrequency(5000000); // 1 MHz (safe for most SPI flash modules)

    CS = cs;
    pins.digitalWritePin(CS, 1); // Deselect chip
  }

  /**
   */
  //% block
  export function readJedecId(): number[] {
    /*let writeBuffer = pins.createBuffer(4)
        writeBuffer[0] = 0x9f
        writeBuffer[1] = 0x0
        writeBuffer[2] = 0x0
        writeBuffer[3] = 0x0

        let readBuffer = pins.createBuffer(4)*/

    pins.digitalWritePin(CS, 0); // Select the chip
    let result: number[] = [];
    pins.spiWrite(0x9f); // Send JEDEC ID command
    result.push(pins.spiWrite(0x00)); // Read byte 1 (Manufacturer ID)
    result.push(pins.spiWrite(0x00)); // Read byte 2 (Memory Type)
    result.push(pins.spiWrite(0x00)); // Read byte 3 (Capacity)

    //pins.spiTransfer(writeBuffer, readBuffer)

    pins.digitalWritePin(CS, 1); // Deselect chip
    //return [readBuffer[1], readBuffer[2], readBuffer[3]]

    return result;
  }

  /**
   */
  //% block
  export function readData(address: number, length: number): Buffer {
    const CMD_READ_DATA = 0x03;
    const bufferSize = 4 + length;
    let commandBuffer = pins.createBuffer(bufferSize);
    commandBuffer.fill(0);
    commandBuffer[0] = CMD_READ_DATA;
    commandBuffer[1] = (address >> 16) & 0xff;
    commandBuffer[2] = (address >> 8) & 0xff;
    commandBuffer[3] = address & 0xff;

    let responseBuffer = pins.createBuffer(bufferSize);
    pins.digitalWritePin(CS, 0); // Select the chip
    pins.spiTransfer(commandBuffer, responseBuffer);
    pins.digitalWritePin(CS, 1); // Deselect the chip
    for (let i = 0; i < responseBuffer.length; i++) {
      serial.writeString(toHex(responseBuffer[i]) + " ");
    }
    serial.writeLine("");
    return responseBuffer.slice(4);
  }

  /**
   */
  //% block
  export function printJedecId(): void {
    let jedec_id = [0, 0, 0];
    //releasePowerDown()
    jedec_id = readJedecId();
    serial.writeLine(
      "JEDEC ID: " +
        toHex(jedec_id[0]) +
        " " +
        toHex(jedec_id[1]) +
        " " +
        toHex(jedec_id[2])
    );
  }

  /**
   */
  //% block
  export function printData(address: number, length: number): void {
    let data = readData(address, length);
    for (let i = 0; i < length; i++) {
      serial.writeString(toHex(data[i]) + " ");
    }
    serial.writeLine("");
  }
}

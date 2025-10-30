//% color=#0080ff icon="\uf0c7" block="SPI Flash"
namespace SPIFlash {
  //% blockId=spiflash_init block="initialize flash with CS pin %pin"
  //% shim=SPIFlash::init
  export function init(pin: DigitalPin): void {
    return;
  }

  //% blockId=spiflash_readid block="read JEDEC ID"
  //% shim=SPIFlash::readJedecID
  export function readJedecID(): number {
    return 0;
  }

  //% blockId=spiflash_write_byte block="write byte %data|to address %address"
  //% shim=SPIFlash::writeByte
  export function writeByte(address: number, data: number): void {
    return;
  }

  //% blockId=spiflash_read_byte block="read byte from address %address"
  //% shim=SPIFlash::readByte
  export function readByte(address: number): number {
    return 0;
  }

  //% blockId=spiflash_erase_sector block="erase sector at address %address"
  //% shim=SPIFlash::eraseSector
  export function eraseSector(address: number): void {
    return;
  }
}

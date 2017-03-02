#include <stdio.h>
#include <stdlib.h>
#include <bcm2835.h>
int main(int argc, char** argv) {
if (!bcm2835_init())
        return 1;
 char buf[] = {0xE7};
 bcm2835_i2c_begin ();
 bcm2835_i2c_setSlaveAddress (0x40);
 bcm2835_i2c_write (buf,1);
 bcm2835_i2c_read (buf,1);
 printf("User Register = %X \r\n",buf[0]);
 bcm2835_i2c_end ();
 return (EXIT_SUCCESS);
}


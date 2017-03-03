#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <getopt.h>
#include "irslinger.h"

#define DEFAULT_TEMP 25

#define FAN_SPEED_LOWEST 0b1100  //3
#define FAN_SPEED_LOW 0b0010	//4
#define FAN_SPEED_MEDIUM 0b1010  //5
#define FAN_SPEED_HIGH 0b0110    //6
#define FAN_SPEED_HIGHEST 0b1110 //7
#define FAN_SPEED_AUTO 0b0101 	//10

#define SWING_LOWEST 0b10000000  //1
#define SWING_LOW 0b01000000	 //2
#define SWING_MEDIUM 0b11000000  //3
#define SWING_HIGH 0b00100000    //4
#define SWING_HIGHEST 0b10100000 //5
#define SWING_AUTO 0b11110000	 //15

#define MODE_COOL 0b1100
#define MODE_HEAT 0b0010
#define MODE_DRY 0b0100
#define MODE_AUTO 0b0000

#define ON 0b10000000
#define OFF 0b00000000

#define OPTION_POWERFUL 0b10000000
#define OPTION_QUIET 0b00000100
#define OPTION_NONE 0b00000000

#define POSITION_ON_OFF_MODE 5
#define POSITION_TEMPERATURE 6
#define POSITION_FLUX 8
#define POSITION_OPTION 13
#define POSITION_CHECKSUM 18

#define PULSE 450
#define ZERO 435
#define ONE 1300
#define GAP 9900
#define INTRO_PULSE 3500
#define INTRO_GAP 1750

unsigned char reverse_byte(unsigned char x)
{
    static const unsigned char table[] = {
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff,
    };
    return table[x];
}

void print_binary(char c) {
    int i;
    for (i = 7 ; i >= 0 ; i--){
        printf("%d", (c >> i & 1));
    }
}

void print_usage(){
    fprintf(stderr, "Usage: encode [-x (power off)] [-q (quiet)] [-p (powerful)] [-m mode] [-t temperature]\nMode= 0:AUTO\n1:COOL\n2:HEAT\n3:DRY\n");
    exit(0);
}

int main(int argc, char** argv){

    int opt;
    char temp = DEFAULT_TEMP;
    char option = OPTION_NONE;
    char swing = SWING_AUTO;
    char fan = FAN_SPEED_AUTO;
    char on_off = ON;
    char mode = MODE_AUTO;

    typedef struct {
        char* temprature;
        char* power;
        char* profile;
        char* mode;
        char* fan;
        char* swing;
    } display_t;

    display_t display = { "25", "ON", "NONE", "AUTO", "AUTO", "AUTO" };

    while ((opt = getopt(argc, argv, "xqps:f:m:t:")) != -1) {
        switch (opt) {
            case 't':
                temp = atoi (optarg);
                if (temp < 16 || temp > 30) {
                    temp = DEFAULT_TEMP;
                    printf("temprature %s not valid, %d by defaut\n", optarg, DEFAULT_TEMP);
                }
                display.temprature = optarg;
                break;
            case 'x':
                on_off = OFF;
                display.power = "OFF";
            case 'q':
                option = OPTION_QUIET;
                display.profile = "QUIET";
                break;
            case 'p':
                option = OPTION_POWERFUL;
                display.profile = "POWERFUL";
                break;
            case 'm':
                if (!strcmp(optarg,"AUTO")) {
                    mode = MODE_AUTO;
                } else if (!strcmp(optarg,"COOL")) {
                    mode = MODE_COOL;
                } else if (!strcmp(optarg,"HEAT")) {
                    mode = MODE_HEAT;
                } else if (!strcmp(optarg,"DRY")) {
                    mode = MODE_DRY;
                } else {
                    printf("mode %s not valid, AUTO by defaut\n", optarg);
                    mode = MODE_AUTO;
                }
                display.mode = optarg;
                break;
            case 'f':
                if (!strcmp(optarg,"AUTO")) {
                    fan = FAN_SPEED_AUTO;
                } else if (!strcmp(optarg,"0")) {
                    fan = FAN_SPEED_LOWEST;
                } else if (!strcmp(optarg,"1")) {
                    fan = FAN_SPEED_LOW;
                } else if (!strcmp(optarg,"2")) {
                    fan = FAN_SPEED_MEDIUM;
                } else if (!strcmp(optarg,"3")) {
                    fan = FAN_SPEED_HIGH;
                } else if (!strcmp(optarg,"4")) {
                    fan = FAN_SPEED_HIGHEST;
                } else {
                    printf("fan %s not valid, AUTO by defaut\n", optarg);
                    fan = FAN_SPEED_AUTO;
                }
                display.fan = optarg;
                break;
            case 's':
                if (!strcmp(optarg,"AUTO")) {
                    swing = SWING_AUTO;
                } else if (!strcmp(optarg,"0")) {
                    swing = SWING_LOWEST;
                } else if (!strcmp(optarg,"1")) {
                    swing = SWING_LOW;
                } else if (!strcmp(optarg,"2")) {
                    swing = SWING_MEDIUM;
                } else if (!strcmp(optarg,"3")) {
                    swing = SWING_HIGH;
                } else if (!strcmp(optarg,"4")) {
                    swing = SWING_HIGHEST;
                } else {
                    printf("swing %s is not valid, AUTO by defaut\n",optarg);
                    swing = SWING_AUTO;
                }
                display.swing = optarg;
                break;
            default:
                printf("argument %c is not valid\n",opt);
                print_usage();
        }
    }

    char intro[8] = {0x40, 0x04, 0x07, 0x20, 0x00, 0x00, 0x00, 0x60};

    char frame[19] = {
        0b01000000, 0b00000100, 0b00000111, 0b00100000,
        0b00000000, 0b00000000, 0b00000000, 0b00000001,
        0b00000000, 0b00000000, 0b00000000, 0b01100000,
        0b00000110, 0b00000000, 0b00000000, 0b00000001,
        0b00000000, 0b01100000, 0b00000000
    };

    int i, j;
    char on_off_mode = on_off | mode;

    if (option == OPTION_QUIET){
        fan = FAN_SPEED_LOWEST;
        display.fan = "0";
    } else if (option == OPTION_POWERFUL){
        fan = FAN_SPEED_AUTO;
        display.fan = "AUTO";
    }
    char flux = swing  | fan;

    temp <<= 1;
    frame[POSITION_TEMPERATURE] = temp;
    frame[POSITION_ON_OFF_MODE] = on_off_mode;
    frame[POSITION_FLUX] = flux;
    frame[POSITION_OPTION] = option;

    int checksum = reverse_byte(reverse_byte(temp) + reverse_byte(option) + reverse_byte(flux) + reverse_byte(on_off_mode));
    checksum = 0;
    for ( i = 0 ; i < 19 ; i++ ) {
        checksum +=reverse_byte(frame[i]);
    }
    checksum = reverse_byte(checksum);
    checksum &= 0xFF; // force 1 byte
    frame[POSITION_CHECKSUM] = checksum;

    printf("NEW STATE:\n power: %s\n temprature: %s\n mode: %s\n swing: %s\n fan: %s\n profile: %s\n", display.power, display.temprature, display.mode, display.swing, display.fan, display.profile);

    int timings[439];
    int timing, timingIndex;

    timings[0] = INTRO_PULSE;
    timings[1] = INTRO_GAP;

    for (i = 0 ; i < 8 ; i++) {
        for (j = 7 ; j >= 0 ; j--) {
            timing = ((intro[i] >> j) & 1) == 0 ? ZERO : ONE;
            timingIndex = 2 + i * 8 * 2 + (7 - j) * 2;

            timings[timingIndex] = PULSE;
            timings[timingIndex + 1] = timing;
        }
    }

    timings[130] = PULSE;
    timings[131] = GAP;

    timings[132] = INTRO_PULSE;
    timings[133] = INTRO_GAP;

    for (i = 0 ; i < 19 ; i++) {
        for (j = 7 ; j >= 0 ; j--) {
            timing = ((frame[i] >> j) & 1) == 0 ? ZERO : ONE;
            timingIndex = 134 + i * 8 * 2 + (7 - j) * 2;

            timings[timingIndex] = PULSE;
            timings[timingIndex + 1] = timing;
        }
    }

    timings[438] = PULSE;

    uint32_t outPin = 17;           // The Broadcom pin number the signal will be sent on
    int frequency = 38000;          // The frequency of the IR signal in Hz
    double dutyCycle = 0.5;         // The duty cycle of the IR signal. 0.5 means for every cycle, the LED will turn on for half the cycle time, and off the other half

    int result = irSlingRaw(
        outPin,
        frequency,
        dutyCycle,
        timings,
        sizeof(timings) / sizeof(int)
    );

    return result;
}

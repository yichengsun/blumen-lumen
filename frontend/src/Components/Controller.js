import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socketIOClient from 'socket.io-client';

import './Styles/Controller.css';

import BlumenLumenContent from './BlumenLumenContent';
import RoomLightContent from './RoomLightContent';

import {
    navBarSelectionStates,
    LightRoomStates,
    LightRoomStatesBrightness
} from '../Controllers/States';

const defaultBlumenBehavior = 'circular';
const defaultBlumenOpenLevel = 100;

const defaultLightRoomMode = LightRoomStates.BRAINSTORMING;
const defaultPalette = 0;
// TODO (slider UX): During this lockout the slider silently ignores drag events
// and snaps back to its last position — students may think the app is frozen.
// Consider showing a visible "motor moving" disabled state instead.
const defaultTimeOfOpening = 80; // seconds; must stay >= FULL_PERIOD/1000 in blumen-motor.ino

// Connects back to whichever host served this page, so the app works
// regardless of what IP the NUC is assigned — no hardcoded address needed.
// TODO (sync timer): defaultTimeOfOpening (80s below) is the UI lockout while
// the motor moves. It must be >= FULL_PERIOD in blumen-motor.ino (currently
// 70500ms = 70.5s). If FULL_PERIOD is recalibrated, update both values.
const socket = socketIOClient(`http://${window.location.hostname}`);

/*
    blumenMode - is a blumen in an default or custom mode ('default', 'custom')
    blumenBehavior - blumen behaviour preset ('circular', 'sweep') - Values codes stored in blumenBehaviorStates

    blumenOpenLevel - value of flower 'opennes' (float), updated after finger release on slider
    blumenOpenLevelPrevious - previous value of opennes level - used for counting the time freeze for the flower enginefinger
    blumenOpenLevelSlider - value that is showed on a slider, used to move the knob, updated during finger drag

    activeCountDown - is the timer on. true after blumenOpenLevel change and seconds >0 , false when seconds == 0
    seconds - amount of seconds left on a timer

    colorPaletteIndex - index of the active palette (0,1,2,3) - based on that the actual Array with colors is sent to the server
    

    TODO: Define final values when we will have IoT Hub
    lightAllOn - if the all lights are on (bool) (true = all lights on, false = all lights off)
    lightBrightnessArray - TBD but for now array with brightness values (array) (Skylight, Left, Center, Right)
    lightRoomMode - mode of the room (int) (0,1,2,3,4) - Values codes stored in defaultLightRoomMode

*/

const Controller = ({ navBarSelection }) => {
    const [webSocketConnection, setWebSocketConnection] = React.useState(false);

    /**
     *
     * Blumen Lumen Hooks
     */
    const [blumenMode, setBlumenMode] = React.useState();

    const [blumenBehavior, setBlumenBehavior] = React.useState(
        defaultBlumenBehavior
    );
    const [blumenOpenLevel, setBlumenOpenLevel] = React.useState(
        defaultBlumenOpenLevel
    );
    const [
        blumenOpenLevelPrevious,
        setBlumenOpenLevelPrevious
    ] = React.useState(defaultBlumenOpenLevel);
    const [blumenOpenLevelSlider, setBlumenOpenLevelSlider] = React.useState(
        defaultBlumenOpenLevel
    );

    const [colorPaletteIndex, setColorPaletteIndex] = React.useState(
        defaultPalette
    );

    const [activeCountDown, setActiveCountDown] = React.useState(false);
    const [seconds, setSeconds] = React.useState(0);

    /**
     *
     * Lights Hooks
     */

    const [lightAllOn, setLightAllOn] = React.useState(false);
    const [lightBrightnessArray, setLightBrightnessArray] = React.useState(
        LightRoomStatesBrightness.BRAINSTORMING
    );
    const [lightRoomMode, setLightRoomMode] = React.useState(
        defaultLightRoomMode
    );

    /**
     * Initial Hook, getting info from the server about the state
     */
    React.useEffect(() => {
        socket.on('blumenInitiate', function(data) {
            setBlumenMode(data.blumenMode);
            if (data.blumenMode === 'default') {
                setBlumenBehavior(data.blumenBehavior);
                setBlumenOpenLevel(data.blumenOpenLevel);
                setBlumenOpenLevelSlider(data.blumenOpenLevel);
                setBlumenOpenLevelPrevious(data.blumenOpenLevel);
                //TODO: How to deal with the color palette right now
                // setColor(data.blumenColor);
            } else {
                setBlumenBehavior(defaultBlumenBehavior);
                setBlumenOpenLevel(defaultBlumenOpenLevel);
                setBlumenOpenLevelPrevious(defaultBlumenOpenLevel);
                setBlumenOpenLevelSlider(defaultBlumenOpenLevel);
                //TODO: How to deal with the color palette right now
                // setColor(defaultColor);
            }

            console.log('Coming from Blumen:', data);
            setWebSocketConnection(true);
        });
        // eslint-disable-next-line
    }, []);

    /**
     * Sending the mode ('custom' or 'default') after the hook changed
     */
    React.useEffect(() => {
        if (blumenMode === 'default') {
            setBlumenBehavior(defaultBlumenBehavior);
            setColorPaletteIndex(defaultPalette);
        }

        if (webSocketConnection) {
            socket.emit('blumenMode', {
                blumenMode: blumenMode
            });
        }
        console.log('Sending... BlumenMode: ', blumenMode);
        // eslint-disable-next-line
    }, [blumenMode]);

    /**
     * Sending the behaviour (eg 'ripple', 'star' or 'twist') after the hook changed
     */

    React.useEffect(() => {
        if (webSocketConnection) {
            console.log('Sending... blumenBehavior: ', blumenBehavior);
            socket.emit('blumenBehavior', {
                blumenBehavior: blumenBehavior
            });
        }
        // eslint-disable-next-line
    }, [blumenBehavior]);

    /**
     * Sending the blumenOpen ('opened' or 'closed') after the hook changed
     */
    React.useEffect(() => {
        if (webSocketConnection) {
            let tempValue = blumenOpenLevel;

            if (blumenOpenLevel === 0) {
                tempValue = 1;
            }
            if (blumenOpenLevel === 100) {
                tempValue = 99;
            }
            tempValue = tempValue / 100;
            console.log('Sending... blumenOpenLevel: ', tempValue);
            socket.emit('blumenOpenLevel', {
                blumenOpenLevel: tempValue
            });
        }
        // eslint-disable-next-line
    }, [blumenOpenLevel]);

    /**
     * Timer, every second going down when is 0 chance activeCountDown to false
     */
    React.useEffect(() => {
        let interval = null;
        if (activeCountDown) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds - 1);
            }, 1000);
        }
        if (seconds === 0) {
            setActiveCountDown(false);
        }
        // console.log(seconds);
        // console.log(activeCountDown);
        return () => clearInterval(interval);
    }, [activeCountDown, seconds]);

    /**
     * Sending active color palette index after colorPaletteIndex was modified
     */
    React.useEffect(() => {
        if (webSocketConnection) {
            console.log('Sending... ColorPalette: ', colorPaletteIndex);
            socket.emit('blumenColorPalette', {
                blumenColorPalette: colorPaletteIndex
            });
        }
        // eslint-disable-next-line
    }, [colorPaletteIndex]);

    /*
      Blumen Functions
     
     */
    function handleBlumenModeChange(e) {
        e.preventDefault();
        let changeToValue = blumenMode === 'custom' ? 'default' : 'custom';
        setBlumenMode(changeToValue);
    }
    function handleBlumenBehaviorChange(e, behaviorState) {
        e.preventDefault();
        setBlumenBehavior(behaviorState);
    }
    function handleBlumenOpenSliderChange(e, value) {
        e.preventDefault();
        if (activeCountDown === false) {
            console.log('Changesss: ', value);
            setBlumenOpenLevelSlider(value);
        }
    }
    function handleBlumenOpenChange(e, value) {
        e.preventDefault();

        // make toggle interactive when the timer is off
        if (activeCountDown === false) {
            console.log('Change: ', value);
            let duration =
                (Math.abs(blumenOpenLevelPrevious - value) / 100) *
                defaultTimeOfOpening;

            setBlumenOpenLevel(value);
            setBlumenOpenLevelPrevious(value);
            setSeconds(duration);
            setActiveCountDown(true);
        }
    }

    function handleColorPaletteChange(e, index) {
        e.preventDefault();
        setColorPaletteIndex(index);
    }

    /*
      Light Functions
     
     */
    function handleLightAllOnChange(e, value) {
        e.preventDefault();
        setLightAllOn(value);
    }

    function handleLightBrightness(lightIndex, brightness) {
        let tempLightBrightnessArray = [];
        tempLightBrightnessArray = [
            lightBrightnessArray[0],
            lightBrightnessArray[1],
            lightBrightnessArray[2],
            lightBrightnessArray[3]
        ];

        tempLightBrightnessArray[lightIndex] = brightness;

        setLightBrightnessArray(tempLightBrightnessArray);
        console.log(lightBrightnessArray);
    }

    function handleLightRoomModeChange(e, value) {
        e.preventDefault();
        setLightRoomMode(value);
    }

    /*
    
        Light Room | Hooks
    */

    React.useEffect(() => {
        let tempLightBrightness = [];
        switch (lightRoomMode) {
            case LightRoomStates.BRAINSTORMING:
                tempLightBrightness = LightRoomStatesBrightness.BRAINSTORMING;
                break;
            case LightRoomStates.CODING_BUILDING:
                tempLightBrightness = LightRoomStatesBrightness.CODING_BUILDING;
                break;
            case LightRoomStates.MEDITATION:
                tempLightBrightness = LightRoomStatesBrightness.MEDITATION;
                break;
            default:
            // code block
        }
        setLightBrightnessArray(tempLightBrightness);
    }, [lightRoomMode]);

    React.useEffect(() => {
        console.log('From useEffect:', lightBrightnessArray);
    }, [lightBrightnessArray]);

    /*
    
        Return function
    */
    return (
        <motion.div className="Content">
            <AnimatePresence exitBeforeEnter>
                {navBarSelection === navBarSelectionStates.BLUMEN_LUMEN ? (
                    <div key="BLC">
                        <BlumenLumenContent
                            blumenMode={blumenMode}
                            blumenBehavior={blumenBehavior}
                            blumenOpenLevelSlider={blumenOpenLevelSlider}
                            colorPaletteIndex={colorPaletteIndex}
                            seconds={seconds}
                            //Functions:
                            handleBlumenModeChange={handleBlumenModeChange}
                            handleBlumenBehaviorChange={
                                handleBlumenBehaviorChange
                            }
                            handleBlumenOpenSliderChange={
                                handleBlumenOpenSliderChange
                            }
                            handleBlumenOpenChange={handleBlumenOpenChange}
                            handleColorPaletteChange={handleColorPaletteChange}
                        />
                    </div>
                ) : (
                    <div key="RLC">
                        <RoomLightContent
                            lightAllOn={lightAllOn}
                            lightBrightnessArray={lightBrightnessArray}
                            lightRoomMode={lightRoomMode}
                            //Functions:
                            handleLightAllOnChange={handleLightAllOnChange}
                            handleLightBrightness={handleLightBrightness}
                            handleLightRoomModeChange={
                                handleLightRoomModeChange
                            }
                        />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Controller;

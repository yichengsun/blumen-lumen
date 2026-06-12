import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/RoomLightContent.css';

import Toggle from './Toggle';
import Button from './Button';
import LightSlider from './LightSlider';

import { LightRoomStates, lightsIndexes } from '../Controllers/States';
import Variants from '../Controllers/Variants';

const RoomLightContent = ({
    lightAllOn,
    lightBrightnessArray,
    lightRoomMode,
    handleLightAllOnChange,
    handleLightBrightness,
    handleLightRoomModeChange
}) => {
    return (
        <motion.div
            key="RoomLightContent"
            className="RoomLightContent"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={Variants.BlumenLumenContent}
        >
            <div className="TopSwitcher">
                <h3>All lights</h3>
                <Toggle
                    toggle1="On"
                    toggle2="Off"
                    handleToggle={handleLightAllOnChange}
                    state={lightAllOn}
                />
            </div>

            <div className="LightBrightnessSection">
                <LightSlider
                    title="Skylight"
                    lightIndex={lightsIndexes.SKYLIGHT}
                    value={lightBrightnessArray[lightsIndexes.SKYLIGHT]}
                    handleOnChange={handleLightBrightness}
                />
                <LightSlider
                    title="Left Panel"
                    lightIndex={lightsIndexes.LEFT}
                    value={lightBrightnessArray[lightsIndexes.LEFT]}
                    handleOnChange={handleLightBrightness}
                />
                <LightSlider
                    title="Center Panel"
                    lightIndex={lightsIndexes.CENTER}
                    value={lightBrightnessArray[lightsIndexes.CENTER]}
                    handleOnChange={handleLightBrightness}
                />
                <LightSlider
                    title="Right Panel"
                    lightIndex={lightsIndexes.RIGHT}
                    value={lightBrightnessArray[lightsIndexes.RIGHT]}
                    handleOnChange={handleLightBrightness}
                />
            </div>
            <div className="BehaviourPreset">
                <h3>Choose behavior preset</h3>
                <div className="BehaviourPresetButtons">
                    <Button
                        title="Brainstorming"
                        buttonIndex={LightRoomStates.BRAINSTORMING}
                        isActive={
                            lightRoomMode === LightRoomStates.BRAINSTORMING
                                ? true
                                : false
                        }
                        handleClick={handleLightRoomModeChange}
                    />
                    <Button
                        title="Coding / Building"
                        buttonIndex={LightRoomStates.CODING_BUILDING}
                        isActive={
                            lightRoomMode === LightRoomStates.CODING_BUILDING
                                ? true
                                : false
                        }
                        handleClick={handleLightRoomModeChange}
                    />
                    <Button
                        title="Meditation"
                        buttonIndex={LightRoomStates.MEDITATION}
                        isActive={
                            lightRoomMode === LightRoomStates.MEDITATION
                                ? true
                                : false
                        }
                        handleClick={handleLightRoomModeChange}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default RoomLightContent;

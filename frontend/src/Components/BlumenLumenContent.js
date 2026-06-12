import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import './Styles/BlumenLumenContent.css';

import Toggle from './Toggle';
import Button from './Button';
import OpenSlider from './OpenSlider';
import TimerMessage from './TimerMessage';
import ColorPicker from './ColorPicker';

import Variants from '../Controllers/Variants';

const BlumenLumenContent = ({
    blumenMode,
    blumenBehavior,
    blumenOpenLevelSlider,
    seconds,
    colorPaletteIndex,

    handleBlumenModeChange,
    handleBlumenBehaviorChange,
    handleBlumenOpenSliderChange,
    handleBlumenOpenChange,
    handleColorPaletteChange
}) => {
    return (
        <motion.div
            key="BlumenLumenContent"
            className="BlumenLumenContent"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={Variants.BlumenLumenContent}
        >
            <motion.div
                className="TopSwitcher"
                animate={blumenMode === 'custom' ? 'custom' : 'default'}
                variants={Variants.TopSwitcher}
            >
                <motion.div>
                    <h3>Blumen mode</h3>
                </motion.div>
                <motion.div>
                    <Toggle
                        toggle1="Custom"
                        toggle2="Default"
                        handleToggle={handleBlumenModeChange}
                        state={blumenMode}
                        seconds={0}
                    />
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {blumenMode === 'custom' ? (
                    <motion.div
                        key="BlumenLumenCustomSection"
                        className="BlumenLumenCustomSection"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={Variants.BlumenLumenCustomSection}
                    >
                        <div className="BehaviourPreset">
                            <h3>Choose a preset</h3>
                            <div className="BehaviourPresetButtons">
                                <Button
                                    title="Circular"
                                    buttonIndex="circular"
                                    isActive={
                                        blumenBehavior === 'circular'
                                            ? true
                                            : false
                                    }
                                    handleClick={handleBlumenBehaviorChange}
                                />
                                <Button
                                    title="Stripes"
                                    buttonIndex="stripes"
                                    isActive={
                                        blumenBehavior === 'stripes'
                                            ? true
                                            : false
                                    }
                                    handleClick={handleBlumenBehaviorChange}
                                />
                                <Button
                                    title="Rotation"
                                    buttonIndex="rotation"
                                    isActive={
                                        blumenBehavior === 'rotation'
                                            ? true
                                            : false
                                    }
                                    handleClick={handleBlumenBehaviorChange}
                                />
                                <Button
                                    title="Sweep"
                                    buttonIndex="sweep"
                                    isActive={
                                        blumenBehavior === 'sweep'
                                            ? true
                                            : false
                                    }
                                    handleClick={handleBlumenBehaviorChange}
                                />
                            </div>
                        </div>
                        <div className="Blumenphase">
                            <h3>Choose Blumen phase</h3>
                            <OpenSlider
                                value={blumenOpenLevelSlider}
                                seconds={seconds}
                                handleChangeCommitted={handleBlumenOpenChange}
                                handleChange={handleBlumenOpenSliderChange}
                            />

                            <TimerMessage seconds={seconds} />
                        </div>

                        <div className="ColorPickerSection">
                            <h3>Choose light palette</h3>
                            <ColorPicker
                                colorPaletteIndex={colorPaletteIndex}
                                handleColorPaletteChange={
                                    handleColorPaletteChange
                                }
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="BlumenLumenDefaultSection"
                        className="BlumenLumenDefaultSection"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={Variants.BlumenLumenDefaultSection}
                    >
                        <motion.img
                            src={require('../Imgs/blumen-viz-v3.jpg')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BlumenLumenContent;

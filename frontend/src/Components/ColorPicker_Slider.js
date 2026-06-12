import * as React from 'react';
import { motion } from 'framer-motion';
import { HuePicker } from 'react-color';

import './Styles/ColorPicker.css';

const ColorPicker = ({ blumenColor, handleChangeComplete }) => {
    function handleChangeCompleteInternal(color, event) {
        handleChangeComplete(color.rgb);
    }

    return (
        <motion.div className="ColorPicker">
            <motion.div>
                <HuePicker
                    color={blumenColor}
                    onChangeComplete={handleChangeCompleteInternal}
                />
            </motion.div>
            <motion.div className="SelectedColor">
                <motion.div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '25px',
                        backgroundColor: `rgba(${blumenColor.r}, ${blumenColor.g}, ${blumenColor.b}, ${blumenColor.a}`
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export default ColorPicker;

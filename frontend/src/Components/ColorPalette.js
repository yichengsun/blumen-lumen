import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/ColorPalette.css';

import Variants from '../Controllers/Variants';

const ColorPalette = ({ colors, paletteIndex, isActive, handleClick }) => {
    function rgbToHex(rgb) {
        let hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    }

    function fullColorHex(colors) {
        let red = rgbToHex(colors.r);
        let green = rgbToHex(colors.g);
        let blue = rgbToHex(colors.b);
        let values = red + green + blue;
        return `#${values}`;
    }

    return (
        <motion.div
            className="ColorPalette"
            whileTap={{ scale: 0.8 }}
            animate={isActive ? 'active' : 'inActive'}
            variants={Variants.ColorPalette}
            onClick={e => handleClick(e, paletteIndex)}
        >
            {/* <motion.div style={`background-color: ${colors[0]}`}></motion.div> */}
            <motion.div
                style={{
                    backgroundColor: fullColorHex(colors[0])
                }}
            ></motion.div>
            <motion.div
                style={{
                    backgroundColor: fullColorHex(colors[1])
                }}
            ></motion.div>
            <motion.div
                style={{
                    backgroundColor: fullColorHex(colors[2])
                }}
            ></motion.div>
            <motion.div
                style={{
                    backgroundColor: fullColorHex(colors[3])
                }}
            ></motion.div>

            {/* <motion.div style={`background-color: ${colors[1]}`}></motion.div>
            <motion.div style={`background-color: ${colors[2]}`}></motion.div>
            <motion.div style={`background-color: ${colors[3]}`}></motion.div> */}
        </motion.div>
    );
};

export default ColorPalette;

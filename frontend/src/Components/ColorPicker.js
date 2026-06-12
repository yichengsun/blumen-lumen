import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/ColorPicker.css';
import ColorPalette from './ColorPalette';

import { colorPaletteArray } from '../Controllers/States';

const ColorPicker = ({ colorPaletteIndex, handleColorPaletteChange }) => {
    return (
        <motion.div className="ColorPicker">
            <ColorPalette
                colors={colorPaletteArray[0]}
                paletteIndex={0}
                isActive={colorPaletteIndex === 0 ? true : false}
                handleClick={handleColorPaletteChange}
            />
            <ColorPalette
                colors={colorPaletteArray[1]}
                paletteIndex={1}
                isActive={colorPaletteIndex === 1 ? true : false}
                handleClick={handleColorPaletteChange}
            />
            <ColorPalette
                colors={colorPaletteArray[2]}
                paletteIndex={2}
                isActive={colorPaletteIndex === 2 ? true : false}
                handleClick={handleColorPaletteChange}
            />
            <ColorPalette
                colors={colorPaletteArray[3]}
                paletteIndex={3}
                isActive={colorPaletteIndex === 3 ? true : false}
                handleClick={handleColorPaletteChange}
            />
        </motion.div>
    );
};

export default ColorPicker;

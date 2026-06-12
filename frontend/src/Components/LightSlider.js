import * as React from 'react';
import { motion } from 'framer-motion';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

import './Styles/LightSlider.css';

import Variants from '../Controllers/Variants';

const PrettoSlider = withStyles({
    root: {
        color: '#FFE999',
        height: 8
    },
    thumb: {
        height: 30,
        width: 30,
        backgroundColor: '#FFC700',
        marginTop: -12,
        marginLeft: -12,
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit'
        }
    },

    active: {},

    track: {
        height: 8,
        borderRadius: 4
    },
    rail: {
        height: 8,
        borderRadius: 4,
        color: '#BFBFBF'
    }
})(Slider);

const LightSlider = ({
    title,
    value,
    lightIndex,
    handleOnChange,
    handleChangeCommitted
}) => {
    // const [internalValue, setInternalValue] = React.useState();
    // React.useEffect(() => {
    //     console.log(value);
    // }, [value]);

    function handleChangeInternal(event, value) {
        handleOnChange(lightIndex, value);
    }
    return (
        <motion.div className="LightSliderContent" variants={Variants.Button}>
            <motion.div className="LightTitle">{title}</motion.div>
            <motion.div className="LightButtonONOFF">OFF</motion.div>
            <motion.div className="LightScroll">
                <PrettoSlider
                    value={value}
                    // defaultValue={value}
                    onChange={handleChangeInternal}
                />
            </motion.div>
        </motion.div>
    );
};

export default LightSlider;

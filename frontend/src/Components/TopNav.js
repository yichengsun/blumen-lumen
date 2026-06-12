import * as React from 'react';
import './Styles/TopNav.css';
import { motion } from 'framer-motion';

import { navBarSelectionStates } from '../Controllers/States';

import TopNavButton from './TopNavButton';

const TopNav = ({ navBarSelection, handleNavBarSelectionSwitch }) => {
    return (
        <motion.div className="TopNav">
            <TopNavButton
                buttonIndex={navBarSelectionStates.BLUMEN_LUMEN}
                title="Blumen Lumen"
                isActive={
                    navBarSelection === navBarSelectionStates.BLUMEN_LUMEN
                        ? true
                        : false
                }
                handleNavBarSelectionSwitch={handleNavBarSelectionSwitch}
            />
            {/* In case we willl be adding Light Control to the interface */}
            {/* <TopNavButton
                buttonIndex={navBarSelectionStates.ROOM_LIGHT}
                title="Room Lighting"
                isActive={
                    navBarSelection === navBarSelectionStates.ROOM_LIGHT
                        ? true
                        : false
                }
                handleNavBarSelectionSwitch={handleNavBarSelectionSwitch}
            /> */}
        </motion.div>
    );
};

export default TopNav;

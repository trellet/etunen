import React from 'react';
import Image from 'react-bootstrap/Image';
import ImgIR from '../img/icons/iracing.png';
import ImgAC from '../img/icons/ac.png';
import ImgRF from '../img/icons/rf.png';
import ImgRF2 from '../img/icons/rf2.png';
import ImgGPL from '../img/icons/gpl.png';
import ImgTrellet from '../img/logo-icon.png';

function Icon(props) {
  return <Image className="icon me-2" {...props} />;
}

export const IconIR = <Icon src={ImgIR} />;
export const IconAC = <Icon src={ImgAC} />;
export const IconRF = <Icon src={ImgRF} />;
export const IconRF2 = <Icon src={ImgRF2} />;
export const IconGPL = <Icon src={ImgGPL} />;
export const IconTrellet = <Icon src={ImgTrellet} />;

export function SimIcon({ tag }) {
  switch (tag) {
    case 'IR':
      return IconIR;
    case 'GPL':
      return IconGPL;
    case 'RF2':
      return IconRF2;
    case 'RF':
      return IconRF;
    case 'AC':
      return IconIR;
    default:
      return IconTrellet;
  }
}
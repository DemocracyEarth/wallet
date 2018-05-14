const getFluidStyles = (property, minValue, maxValue) => {
  const screen = { min: 320, max: 1440 };
  const minVal = parseInt(minValue, 10);
  const maxVal = parseInt(maxValue, 10);
  return `
    ${property}: ${minValue};
    @media screen and (min-width: ${screen.min}px) {
      ${property}: calc(${minValue} + ${maxVal - minVal} * (100vw - ${screen.min}px) / ${screen.max - screen.min});
    }
    @media screen and (min-width: ${screen.max}px) {
      ${property}: ${maxValue};
    }
  `;
};

const fluid = (properties, minValue, maxValue) => {
  if (Array.isArray(properties)) {
    return properties.map((property) => { return getFluidStyles(property, minValue, maxValue); });
  }
  return getFluidStyles(properties, minValue, maxValue);
};

export default fluid;

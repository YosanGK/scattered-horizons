export const screenSizes = {
    mobile: 768,
    tablet: 992,
    desktop: 1200
};

export const getResponsiveValue = (mobileVal, tabletVal, desktopVal) => {
    const { innerWidth } = window;
    if (innerWidth < screenSizes.mobile) return mobileVal;
    if (innerWidth < screenSizes.tablet) return tabletVal;
    return desktopVal;
};

export const colors = {
    critical: '#d7191c',
    high: '#fdae61',
    medium: '#ffffbf',
    low: '#a6d96a',
    minimal: '#1a9641',
    default: '#cccccc'
};

export const getColor = (score) => {
    if (score > 4.5) return colors.critical;
    if (score > 3.5) return colors.high;
    if (score > 2.5) return colors.medium;
    if (score > 1.5) return colors.low;
    return colors.minimal;
};
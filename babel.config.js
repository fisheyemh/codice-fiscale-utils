module.exports = function (api) {
    api.cache(true);
    const presets = [["@babel/preset-env", {
        debug: true,
        targets: ["> 1%, ie >= 8"],
        useBuiltIns: "entry",
        corejs: {
            version: 3,
            proposals: true
        }


    }
    ]];
    const plugins = [];
    return {presets, plugins};
};   


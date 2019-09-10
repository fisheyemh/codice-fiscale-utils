module.exports = function (api) {
    api.cache(true);
    const presets = [["@babel/preset-env", {
        debug: true,
        useBuiltIns: 'usage',
        corejs: {version: 3, proposals: true},
    }]];
    const plugins = [];
    return {presets, plugins, sourceType: "unambiguous"};
};   


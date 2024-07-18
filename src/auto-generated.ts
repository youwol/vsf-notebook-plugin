
const runTimeDependencies = {
    "externals": {
        "@youwol/logging": "^0.2.0",
        "@youwol/mkdocs-ts": "^0.5.2",
        "@youwol/rx-vdom": "^1.0.1",
        "@youwol/webpm-client": "^3.0.0",
        "rxjs": "^7.5.6"
    },
    "includedInBundle": {
        "@youwol/vsf-canvas": "^0.3.1",
        "@youwol/vsf-core": "^0.3.2"
    }
}
const externals = {
    "@youwol/logging": {
        "commonjs": "@youwol/logging",
        "commonjs2": "@youwol/logging",
        "root": "@youwol/logging_APIv02"
    },
    "@youwol/mkdocs-ts": {
        "commonjs": "@youwol/mkdocs-ts",
        "commonjs2": "@youwol/mkdocs-ts",
        "root": "@youwol/mkdocs-ts_APIv05"
    },
    "@youwol/rx-vdom": {
        "commonjs": "@youwol/rx-vdom",
        "commonjs2": "@youwol/rx-vdom",
        "root": "@youwol/rx-vdom_APIv1"
    },
    "@youwol/webpm-client": {
        "commonjs": "@youwol/webpm-client",
        "commonjs2": "@youwol/webpm-client",
        "root": "@youwol/webpm-client_APIv3"
    },
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv7"
    }
}
const exportedSymbols = {
    "@youwol/logging": {
        "apiKey": "02",
        "exportedSymbol": "@youwol/logging"
    },
    "@youwol/mkdocs-ts": {
        "apiKey": "05",
        "exportedSymbol": "@youwol/mkdocs-ts"
    },
    "@youwol/rx-vdom": {
        "apiKey": "1",
        "exportedSymbol": "@youwol/rx-vdom"
    },
    "@youwol/webpm-client": {
        "apiKey": "3",
        "exportedSymbol": "@youwol/webpm-client"
    },
    "rxjs": {
        "apiKey": "7",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./index.ts",
    "loadDependencies": [
        "rxjs",
        "@youwol/rx-vdom",
        "@youwol/mkdocs-ts",
        "@youwol/webpm-client",
        "@youwol/logging"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     '@youwol/vsf-notebook-plugin': './index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/vsf-notebook-plugin/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/vsf-notebook-plugin',
        assetId:'QHlvdXdvbC92c2Ytbm90ZWJvb2stcGx1Z2lu',
    version:'0.1.1-wip',
    shortDescription:"Visual Studio Flow plugin to assist with integration in @youwol/mkdocs-ts Notebooks.",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/vsf-notebook-plugin&tab=doc',
    npmPackage:'https://www.npmjs.com/package/@youwol/vsf-notebook-plugin',
    sourceGithub:'https://github.com/youwol/vsf-notebook-plugin',
    userGuide:'https://l.youwol.com/doc/@youwol/vsf-notebook-plugin',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/vsf-notebook-plugin_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/vsf-notebook-plugin#0.1.1-wip~dist/@youwol/vsf-notebook-plugin/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/vsf-notebook-plugin/${entry.name}_APIv01`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}

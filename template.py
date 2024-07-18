import shutil
from pathlib import Path

from youwol.pipelines.pipeline_typescript_weback_npm import Template, PackageType, Dependencies, \
    RunTimeDeps, Bundles, MainModule
from youwol.pipelines.pipeline_typescript_weback_npm.regular import generate_template
from youwol.utils import parse_json

folder_path = Path(__file__).parent

pkg_json = parse_json(folder_path / 'package.json')

externals_deps = {
    "rxjs": "^7.5.6",
    "@youwol/rx-vdom": "^1.0.1",
    "@youwol/mkdocs-ts": "^0.5.2",
    "@youwol/webpm-client": "^3.0.0",
    "@youwol/logging": "^0.2.0",
}
in_bundle_deps = {
    # The next 2 are actually dev dependencies (only types required), included here to be installed by consuming libs.
    "@youwol/vsf-core": "^0.3.2",
    "@youwol/vsf-canvas": "^0.3.1",
}
dev_deps = {}

template = Template(
    path=folder_path,
    type=PackageType.LIBRARY,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals=externals_deps,
            includedInBundle=in_bundle_deps
        ),
        devTime=dev_deps
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile='./index.ts',
            loadDependencies=list(externals_deps.keys()),
            aliases=[]
        )
    ),
    userGuide=True
)

generate_template(template)
shutil.copyfile(
    src=folder_path / '.template' / 'src' / 'auto-generated.ts',
    dst=folder_path / 'src' / 'auto-generated.ts'
)
for file in ['README.md', '.gitignore', '.npmignore', '.prettierignore', 'LICENSE', 'package.json',
             'tsconfig.json', 'jest.config.ts', 'webpack.config.ts']:
    shutil.copyfile(
        src=folder_path / '.template' / file,
        dst=folder_path / file
    )

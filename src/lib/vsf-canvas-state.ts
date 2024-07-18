import { AnyVirtualDOM } from '@youwol/rx-vdom'
import {
    Deployers,
    HtmlTrait,
    Immutable,
    Immutables,
    Modules,
} from '@youwol/vsf-core'
import { StateTrait, Selectable } from '@youwol/vsf-canvas'
import { installJournalModule } from '@youwol/logging'
import * as webpmClient from '@youwol/webpm-client'
import { Views } from '@youwol/mkdocs-ts'

function asMutable<T>(object) {
    return object as T
}

export class VsfCanvasState implements StateTrait {
    select(_entities: Immutables<Selectable>) {}
    displayModuleView(
        module: Immutable<Modules.ImplementationTrait & HtmlTrait>,
    ) {
        Views.popupModal({
            content: module.html(),
            maxWidth: '50%',
            maxHeight: '50%',
        })
    }
    displayModuleJournal(module: Immutable<Modules.ImplementationTrait>) {
        installJournalModule(webpmClient)
            .then(({ JournalState, JournalView }) => {
                const state = new JournalState({
                    journal: {
                        title: "Module's Journal",
                        abstract: '',
                        pages: asMutable(module.journal.pages),
                    },
                })
                return new JournalView({ state })
            })
            .then((journal: AnyVirtualDOM) => {
                const wrapped = {
                    tag: 'div' as const,
                    class: 'overflow-auto journal-view',
                    style: { height: '75vh', width: '75vw' },
                    children: [journal],
                }
                Views.popupModal({
                    content: wrapped,
                    maxHeight: '100%',
                    maxWidth: '100%',
                })
            })
    }
    displayModuleDocumentation(
        _module: Immutable<Modules.ImplementationTrait>,
    ) {}
    displayWorkerEnvironment(
        _workerEnv: Immutable<Deployers.WorkerEnvironmentTrait>,
    ) {}
}

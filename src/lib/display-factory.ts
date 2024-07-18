import type { Projects } from '@youwol/vsf-core'
import type { AnyVirtualDOM, ChildrenLike, VirtualDOM } from '@youwol/rx-vdom'
import type { NotebookTypes } from '@youwol/mkdocs-ts'
import type * as CanvasModule from '@youwol/vsf-canvas'
import { BehaviorSubject, debounceTime, from, Subject } from 'rxjs'
import { install } from '@youwol/webpm-client'
import { VsfCanvasState } from './vsf-canvas-state'
import { setup } from '../auto-generated'

function isElementInViewport(element: HTMLElement, visible$: Subject<boolean>) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                visible$.next(true)
            } else {
                visible$.next(false)
            }
        })
    })
    observer.observe(element)
}

export function displayVsfWorkflow(
    project: Projects.ProjectState,
    workflowId: string,
): AnyVirtualDOM {
    const vsfCanvasVersion =
        setup.runTimeDependencies.includedInBundle['@youwol/vsf-canvas']
    return {
        tag: 'div',
        class: 'w-100 fv-text-primary',
        style: {
            aspectRatio: '1/1',
            maxHeight: '100%',
        },
        children: [
            {
                source$: from(
                    install({
                        modules: [
                            `@youwol/vsf-canvas#${vsfCanvasVersion} as Canvas`,
                        ],
                        css: [
                            '@youwol/fv-widgets#latest~dist/assets/styles/style.youwol.css',
                        ],
                    }),
                ),
                vdomMap: ({ Canvas }) => {
                    const isInViewPort$ = new BehaviorSubject(false)
                    return {
                        tag: 'div',
                        class: 'w-100 h-100',
                        connectedCallback: (elem) => {
                            isElementInViewport(elem, isInViewPort$)
                        },
                        children: [
                            {
                                // Debounce time prevents an error when displaying the flow-chart while 'crazy'
                                // scrolling (gl.createShader(VERTEX_SHADER) returns null).
                                source$: isInViewPort$.pipe(debounceTime(0)),
                                vdomMap: (inVP) =>
                                    inVP
                                        ? new DagView({
                                              project,
                                              Canvas,
                                              workflowId,
                                          })
                                        : { tag: 'div' },
                            },
                        ],
                    }
                },
            },
        ],
    }
}

export class DagView implements VirtualDOM<'div'> {
    public readonly tag = 'div'
    public readonly class = 'w-100 h-100 d-flex flex-column'
    public readonly children: ChildrenLike
    constructor({
        project,
        workflowId,
        Canvas,
    }: {
        project: Projects.ProjectState
        workflowId: string
        Canvas: typeof CanvasModule
    }) {
        const project$ = new BehaviorSubject(project)
        const loading$ = new BehaviorSubject(false)
        const dag3D = new Canvas.Renderer3DView({
            project$,
            workflowId,
            state: new VsfCanvasState(),
        })
        this.children = [
            {
                tag: 'div',
                class: 'w-100 mkdocs-text-0 mkdocs-bg-0 d-flex justify-content-center',
                children: [
                    {
                        tag: 'i',
                        class: {
                            source$: loading$,
                            vdomMap: (l) =>
                                l ? 'fa-spin fa-spinner' : 'fa-sync fv-pointer',
                            wrapper: (d) => `fas ${d}`,
                        },
                        onclick: () => {
                            loading$.next(true)
                            project.clone().then((clone) => {
                                project$.next(clone)
                                loading$.next(false)
                            })
                        },
                    },
                ],
            },
            dag3D,
        ]
    }
}
export const displayFactory: NotebookTypes.DisplayFactory = [
    {
        name: 'VSF-project',
        isCompatible: (d: unknown) => {
            return (
                ['main', 'environment', 'instancePool', 'worksheets', 'macros']
                    .map((key) => d[key])
                    .filter((v) => v === undefined).length === 0
            )
        },
        view: (project: Projects.ProjectState) => {
            return displayVsfWorkflow(project, 'main')
        },
    },
    {
        name: 'VSF-Workflow',
        isCompatible: (d: unknown) => {
            if (d['project'] === undefined || d['wf'] === undefined) {
                return false
            }
            return true
        },
        view: (d: { project: Projects.ProjectState; wf: string }) => {
            return displayVsfWorkflow(d.project, d.wf)
        },
    },
]

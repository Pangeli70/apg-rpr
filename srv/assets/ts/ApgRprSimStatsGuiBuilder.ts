/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomDocument, IApgDomElement,
    IApgDomRange, IApgDomSelect
} from "./ApgDom.ts";
import { ApgGui } from "./ApgGui.ts";

import { ApgGui_Builder } from "./ApgGuiBuilder.ts";
import { ApgGui_Stats } from "./ApgGuiStats.ts";
import { IApgRprSim_Params } from "./ApgRprSimulationBase.ts";

export class ApgRprSimStatsGuiBuilder extends ApgGui_Builder {

    params: IApgRprSim_Params;
    stats: ApgGui_Stats;

    constructor(
        agui: ApgGui,
        aparams: IApgRprSim_Params,
    ) {

        super(agui);

        this.params = aparams;
        this.stats = this.params.stats!;

    }

    override buildHtml() {

        const statsGroupControl = this.#buildStatsGroupControl();

        const controls = [
            statsGroupControl,
        ];
        const r = controls.join("\n");

        return r;

    }


    #buildStatsGroupControl() {

        const panelsNames = Array.from(this.stats.panels.keys());
        const keyValues = new Map<string, string>();
        for (let i = 0; i < panelsNames.length; i++) {
            keyValues.set(`${i}`, panelsNames[i]);
        }
        
        const STAT_PANEL_SELECT_CNT = 'statPanelSelectControl';
        const statPanelSelectControl = this.buildSelectControl(
            STAT_PANEL_SELECT_CNT,
            'Stat',
            this.stats.currentPanelIndex.toString(),
            keyValues,
            () => {
                const select = this.gui.controls.get(STAT_PANEL_SELECT_CNT)!.element as IApgDomSelect;
                const newPanelIndex = parseInt(select.value);
                this.stats.showPanel(newPanelIndex);
                //alert(select.value);
            }
        );

        const STAT_DIV_SELECT_CNT = 'statDivControl';
        const statDivControl = this.buildDivControl(
            STAT_DIV_SELECT_CNT,
            "",
            "",
            this.stats.container
        )


        const r = this.buildGroupControl(
            "statsGroupControl",
            "Statistics:",
            [
                statPanelSelectControl,
                statDivControl
            ],
            this.params.guiSettings!.isStatsGroupOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.params.guiSettings!.isStatsGroupOpened = !this.params.guiSettings!.isStatsGroupOpened
                    this.gui.log('Stats group toggled');
                }
            }

        );
        return r;
    }


}

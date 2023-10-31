/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/16]
 * -----------------------------------------------------------------------
*/

import {
    IApgDomSelect
} from "./ApgDom.ts";

import {
    ApgGui
} from "./ApgGui.ts";

import {
    ApgGui_Builder
} from "./ApgGui_Builder.ts";

import {
    ApgGui_Stats
} from "./ApgGui_StatsPanel.ts";



export class ApgRprSim_StatsGuiBuilder extends ApgGui_Builder {

    stats: ApgGui_Stats;

    constructor(
        agui: ApgGui,
        astats: ApgGui_Stats,
    ) {

        super(agui, 'Stats gui builder');

        this.stats = astats;

    }


    override buildPanel(): string {

        const statsGroupControl = this.#buildStatsGroupControl();

        const controls = [
            statsGroupControl,
        ];
        const r = controls.join("\n");

        return r;

    }



    #buildStatsGroupControl(): string {

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


        const r = this.buildDetailsControl(
            "statsGroupControl",
            "Statistics:",
            [
                statPanelSelectControl,
                statDivControl
            ],
            this.stats.isStatsPanelOpened,
            () => {
                if (!this.gui.isRefreshing) {
                    this.stats.isStatsPanelOpened = !this.stats.isStatsPanelOpened
                    this.gui.logNoTime('Stats group toggled');
                }
            }

        );
        return r;
    }


}

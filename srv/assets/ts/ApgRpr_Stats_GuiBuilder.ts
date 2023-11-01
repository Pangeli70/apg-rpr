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



export class ApgRpr_Stats_GuiBuilder extends ApgGui_Builder {

    stats: ApgGui_Stats;

    constructor(
        agui: ApgGui,
        astats: ApgGui_Stats,
    ) {

        super(agui, 'Stats gui builder');

        this.stats = astats;

    }


    override buildControls(): string {

        const statsGroupControl = this.#buildStatsGroupControl();

        const controls = [
            statsGroupControl,
        ];
        const r = controls.join("\n");

        return r;

    }



    #buildStatsGroupControl(): string {

        const panelsNames = this.stats.panelsNames;
        const keyValues = new Map<string, string>();
        keyValues.set(this.stats.SHOW_ALL_PANELS.toString(), "All");
        for (let i = 0; i < panelsNames.length; i++) {
            keyValues.set(`${i}`, panelsNames[i]);
        }

        const STAT_PANEL_SELECT_CNT = 'statPanelSelectControl';
        const statPanelSelectControl = this.buildSelectControl(
            STAT_PANEL_SELECT_CNT,
            'Show',
            this.stats.currentPanelKey,
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
            false,
            () => {
                if (!this.gui.isRefreshing) {
                    this.stats.isStatsPanelOpened = !this.stats.isStatsPanelOpened
                }
            }

        );
        return r;
    }


}

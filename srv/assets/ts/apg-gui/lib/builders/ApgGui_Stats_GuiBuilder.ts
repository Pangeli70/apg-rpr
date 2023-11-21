/** -----------------------------------------------------------------------
 * @module [apg-gui]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.0.1 [APG 2023/08/16]
 * @version 0.0.8 [APG 2023/11/11]
 * -----------------------------------------------------------------------
*/

import {
    ApgGui_ISelect
} from "../interfaces/ApgGui_Dom.ts";

import {
    ApgGui
} from "../classes/ApgGui.ts";

import {
    ApgGui_Builder
} from "../classes/ApgGui_Builder.ts";

import {
    ApgGui_Stats
} from "../classes/ApgGui_Stats.ts";



export class ApgGui_Stats_GuiBuilder extends ApgGui_Builder {

    private _stats: ApgGui_Stats;


    constructor(
        agui: ApgGui,
        astats: ApgGui_Stats,
    ) {

        super(agui, 'Stats gui builder');

        this._stats = astats;

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

        const panelsNames = this._stats.panelsNames;
        const keyValues = new Map<string, string>();
        keyValues.set(this._stats.SHOW_ALL_PANELS.toString(), "All");
        for (let i = 0; i < panelsNames.length; i++) {
            keyValues.set(`${i}`, panelsNames[i]);
        }

        const STAT_PANEL_SELECT_CNT = 'statPanelSelectControl';
        const statPanelSelectControl = this.buildSelectControl(
            STAT_PANEL_SELECT_CNT,
            'Show',
            this._stats.currentPanelKey,
            keyValues,
            () => {
                const select = this.gui.controls.get(STAT_PANEL_SELECT_CNT)!.element as ApgGui_ISelect;
                const newPanelIndex = parseInt(select.value);
                this._stats.showPanel(newPanelIndex);
                //alert(select.value);
            }
        );

        const STAT_DIV_SELECT_CNT = 'statDivControl';
        const statDivControl = this.buildDivControl(
            STAT_DIV_SELECT_CNT,
            "",
            "",
            this._stats.element
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
                    this._stats.isStatsPanelOpened = !this._stats.isStatsPanelOpened
                }
            }

        );
        return r;
    }


}

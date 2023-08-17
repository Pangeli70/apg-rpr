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

import { ApgGuiBuilder } from "./ApgGuiBuilder.ts";
import { ApgGuiStats } from "./ApgGuiStats.ts";

export class ApgRprSimStatsGuiBuilder extends ApgGuiBuilder {

    stats: ApgGuiStats;

    constructor(
        agui: ApgGui,
        astats: ApgGuiStats
    ) {

        super(agui);

        this.stats = astats;

    }

    override build() {

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
            "Statistics:",
            [
                statPanelSelectControl,
                statDivControl
            ]

        );
        return r;
    }


}

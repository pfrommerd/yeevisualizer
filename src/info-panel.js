import { LitElement, html } from '@polymer/lit-element';

import { state } from './main.js'

class InfoPanel extends LitElement {
    constructor() {
        super();
        var foo = this;
        state.onSelect(function(selection) {
            foo.requestUpdate(null, null);
        });
    }

    render () {
        var elements = [];
        var e = state.selected.map(s => { 
            return html`
                <div class="card">
                    <div class="header">
                        <div class="left">${s.name}</div>
                        <div class="right subtext">${s.location}</div>
                    </div>
                    ${s.createStats()}
                </div>`;
        });
        return html`
            <style>
                .card {
                    background: #fff;
                    width: 400px;
                    min-height: 250px;
                    display: block;
                    position: floating;
                    margin: 20px 20px 10px 10px;
                    border-radius: 4px;
                    box-shadow: 0 2px 1px -1px rgba(0,0,0,.2),
                                0 1px 1px 0 rgba(0,0,0,.14),
                                0 1px 3px 0 rgba(0,0,0,.12);
                    text-align: left;
                    white-space; nowrap;
                    overflow: auto;
                }
                .header {
                    padding: 13px 10px 10px 10px; 
                    font: Roboto,sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    letter-spacing: 0.25px;
                    border-radius: 4px 4px 0px 0px;
                    transition: background-color 0.3s ease-in-out;
                    color: #000;
                    overflow: auto;
                }
                .content {
                    padding: 3px 10px 3px 10px; 
                    border-radius: 0px 0px 4px 4px;
                    font: Roboto,sans-serif;
                    font-size: 15px;
                    font-weight: 370;
                    letter-spacing: 0.25px;
                    transition: background-color 0.3s ease-in-out;
                    color: #000;
                    overflow: auto;
                }
                .header:hover,.subtitle:hover, .content:hover {
                    background-color: #f0f0f0;
                }

                .subtitle {
                    padding: 3px 10px 3px 10px; 
                    font: Roboto,sans-serif;
                    font-size: 18px;
                    font-weight: 400;
                    letter-spacing: 0.25px;
                    transition: background-color 0.3s ease-in-out;
                    color: #000;
                    overflow: auto;
                }
                .heading {
                    font: Roboto,sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    letter-spacing: 0.25px;
                }
                .subtext {
                    font: Roboto,sans-serif;
                    font-size: 18px;
                    font-weight: 400;
                }
                .left {
                    display: block;
                    float: left;
                    width: 50%;
                }
                .right {
                    display: block;
                    float: right;
                    width: 50%;
                }
            </style>
            ${e}
        `;
    }
}

customElements.define('info-panel', InfoPanel);


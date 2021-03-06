import {html,PolymerElement} from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import '../polymer-elements/iron-flex-layout-classes.js';
import '../polymer-elements/paper-progress.js';
import '../polymer-elements/paper-radio-button.js';
import '../polymer-elements/paper-radio-group.js';

import '/static/otree-redwood/src/redwood-decision/redwood-decision.js';
import '/static/otree-redwood/src/redwood-period/redwood-period.js';
import '/static/otree-redwood/src/redwood-decision-bot/redwood-decision-bot.js';
import '/static/otree-redwood/src/otree-constants/otree-constants.js';

import '../color.js';

export class LeepsQueue extends PolymerElement {
    static get template() {
        return html `
            <style include="iron-flex iron-flex-alignment"></style>
            <style>
                .borders{
                    border-style: solid;
                    padding-top:0px;
                    padding-right:0px;
                    padding-bottom:0px;
                    padding-left:0px;
                    margin-top:0px;
                    margin-right:0px;
                    margin-bottom:0px;
                    margin-left:0px;
                }

                .circle{
                    border-radius:50%;
                    text-align: center;
                    vertical-align:middle;
                    height: 110px;
                    width: 110px;
                    margin-left:10px;
                    margin-right:10px;
                }

                paper-progress {
                    margin-bottom: 0.625em;
                    --paper-progress-height: 1.875em;
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }

                tr:nth-child(even) {
                    background-color: #dddddd;
                }
            </style>
            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>
            <!--
            <redwood-decision
                id="channelDecision"
                initial-decision="[[ initialDecision ]]"
                my-decision="{{ _myDecision }}"
                group-decisions="{{ groupDecisions }}"
                on-group-decisions-changed="_onGroupDecisionsChanged"
            >
            </redwood-decision>
            
            
            <redwood-channel
                id="channel"
                channel="group_decisions"
                on-event="_handleGroupDecisionsEvent">
            </redwood-channel>
            -->
            <redwood-channel
                id="channel"
                channel="swap"
                on-event="_handleSwapEvent">
            </redwood-channel>

            <div class="layout horizontal center" style="width: 100%;">
                <div class="borders" style="width: 20%;">
                    Round: [[roundNumber]]
                </div>
                <div class="borders" style="width: 30%;">
                    Exchange Rule: [[swapMethod]]
                </div>
                <div class="borders" style="width: 30%;">
                    Messaging: [[messaging]]
                </div>
                <div class="borders" style="width: 30%;">
                    Time Remaining: [[ _subperiodProgress ]]
                </div>
            </div>

            

            <div class="layout vertical center">
                <div class="layout horizontal borders" style="height: 160px; width: 100%;">
                    <div>
                        <div class="layout vertical center" style="text-align: center;">
                            <p style="height: 65px;
                                        width: 110px;">Position</p>
                            <p style="width: 110px;">Value</p>
                        </div>
                    </div>
                    <template is="dom-repeat" index-as="index" items="{{_reverse(queueList)}}" as="queueListItems">
                        <div class="layout vertical center">
                            <template is="dom-if" if="{{!_button(index,queueList)}}">
                                <div class="circle" style="background-color:{{_shadeCircle(queueListItems, queueList)}};">
                                    <p style="font-size:150%;font-weight:bold;height: 50%;text-align: center;vertical-align:middle;">{{_reverseIndex(index)}}</p>
                                </div>
                            </template>
                            <template is="dom-if" if="{{_button(index,queueList)}}">
                                <button type="button" on-click="_pick" class="circle" style="background-color:{{_shadeCircle(queueListItems,queueList)}};">
                                    <p style="font-size:150%;font-weight:bold;height: 50%;text-align: center;vertical-align:middle;">{{_reverseIndex(index)}}</p>
                                </button>
                            </template>
                            
                            <div>
                                [[_computeValue(index)]]
                            </div>
                        </div>
                        
                    </template>
                </div>

                <div class="layout horizontal borders" style="height: 25%; width: 100%;">
                    <div style="height: 25%; width: 10%;text-align: center;"> Your Decision</div>
                    <div class="layout vertical borders" style="width: 45%;">
                        <div class="layout horizontal">
                            <p>Player you want to exchange position: 
                                    <span id='exchangeText'>[[exchangeText]]</span>
                            </p>
                        </div>
                        <div class="layout horizontal">
                            <template is="dom-if" if="[[ _showOffer() ]]">
                                <p>Your offer: 
                                    <!--
                                        <span id='offerText'> </span>
            -->
                                </p>
                                    <input id="offer" name="offer" type="number" min="1" max="[[payoff]]" style="width: 10%;" required>
                                
                            </template>
                        </div>
                        <template is="dom-if" if="[[ !requestSent ]]">
                            <button type="button" on-click="_handlerequest" style="background-color:#ADD8E6;"> Send your request</button>
                        </template>
                        <template is="dom-if" if="[[ requestSent ]]">
                            <button type="button" on-click="_handlecancel" style="background-color:#FF6961;"> Cancel your request</button>
                        </template>
                        </div class="layout vertical  borders" style="width: 45%;">
                            <p style="margin-right:10px;">Message</p>
                            <template is="dom-if" if="[[ messaging ]]" style="padding-top:10px;padding-bottom:10px;">
                                <input id="message" type="text"  required>
                            </template>
                            <template is="dom-if" if="[[ !messaging ]]">
                                <p style="margin-left:10px;">Disabled</p>
                            </template>
                    </div>
                    </div>
                    
                </div>

                <div class="layout horizontal" style="height: 500px; width: 100%;">
                    <div class="layout vertical borders" style="width: 50%;">
                        <div class="borders" style="width: 100%;text-align: center;">
                            <p style="font-size:150%;">Exchange Requests:</p>
                        </div>
                        <div style="overflow: auto;">
                            <template is="dom-repeat" index-as="index" items="{{requests}}" as="requestsVector">
                                <div class="layout horizontal borders" style=" padding-right:5px;padding-left:15px;">
                                    <div class="layout vertical" >
                                        <div class="layout horizontal" style="
                                                                            padding-top:0px;">
                                            <p style="margin-right:10px;">Position: [[_list(requestsVector, "position")]]  </p>
                                            <template is="dom-if" if="[[ _showOffer() ]]">
                                                <p>Amount: [[_list(requestsVector, "offer")]]</p>
                                            </template>
                                        </div>
                                        <template is="dom-if" if="[[ messaging ]]">
                                            <div>
                                                Message:
                                                <p style="width:250px;overflow: auto;">
                                                 [[_list(requestsVector, "message")]]
                                                </p>
                                            </div>
                                        </template>
                                        
                                    </div>
                                    <div style="margin-top:9px;
                                                margin-left:auto;">
                                        <button type="button" on-click="_handleaccept" style="background-color:#ADD8E6;">Accept</button>
                                        <button type="button" on-click="_handlereject" style="background-color:#FF6961;">Reject</button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="layout vertical" style="width: 50%;">
                        <div class="layout vertical borders">
                            <div class="borders" style="height:40px;font-size:150%;">Your current payoff: [[payoff]]</div>
                            <div class="borders" style="height:40px;font-size:150%;">Exchange History</div>
                            <div class="borders" style="height:400px;overflow: auto;">
                                <table>
                                    <tr> 
                                        <th>Original Position </th>
                                        <th>New Position </th>
                                        <th>Transfer </th>
                                    </tr>
                                    <template is="dom-repeat" index-as="index" items="{{history}}" as="historyVector">
                                        <tr> 
                                            <td>[[_array(historyVector, 0)]] </td>
                                            <td>[[_array(historyVector, 1)]] </td>
                                            <td>[[_array(historyVector, 2)]] </td>
                                        </tr>
                                    </template>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        
        `
    }

    static get properties() {
        return {
            groupDecisions: {
                type: Object,
            },
            _myDecision: {
                type: Number,
            },
            initialDecision:{
                type: Number,
            },
            initialPosition:{
                type: Number,
            },
            myPosition:{
                type: Number,
            },
            currentRequestPartner:{
                type: Number,
                value: 0
            },
            messaging:{
                type: Boolean,
                value: false,
            },
            payoff: {
                type: Number,
            },
            endowment:{
                type: Number,
            },
            queueList: {
                type: Array,
            },
            valueList: {
                type: Array,
            },
            swapMethod: {
                type: String
            },
            value:{
                type: Number
            },
            roundNumber:{
                type: Number
            },
            requests: {
                type: Array,
            },
            history: {
                type: Array,
            },
            requestSent: {
                type: Boolean,
                value: false
            },
            _isPeriodRunning: {
                type: Boolean,
            },
            _subperiodProgress: {
                type: Number,
                value: 0,
            },
            periodLength: {
                type: Number
            },
            timeRemaining:{
                type: Number,
                value: 0,
            }
        }
    }

    _array(a, i) {
        console.log(a);
        console.log(a[i]);
        return a[i];
    }
    _list(requestsVector, string){
        return requestsVector[string];
    }
    _reverse(list){
        return list.slice().reverse();
    }

    _reverseIndex(index){
        return 6 - parseInt(index);
    }

    ready() {
        super.ready()
        console.log(this.queueList);
        this.set('requests', []);
        this.set('history', []);
        this.set('myPosition', this.initialPosition);
        this.set('payoff', this.endowment);
        this.set('exchangeText', "None");
        console.log(this.valueList)
        this.set('value', this.valueList[this.myPosition]);
        console.log(this.value);
        
    }

    _shadeCircle(id,queueList){
        if(id == this.$.constants.idInGroup)
            return '#FF0000';
        else if (queueList.indexOf(id) > queueList.indexOf(parseInt(this.$.constants.idInGroup))){
            return '#E7E7E7';
        }
        else{
            return '#C56BFF';
        }
            
    }

    _button(index,queueList){
        index = 5 - parseInt(index) ;
        if (index < queueList.indexOf(parseInt(this.$.constants.idInGroup))){
            return true;
        }
        else{
            return false;
        }

    }

    _pick(e){
        var index = e.model.index;
        index = 6 - parseInt(index);
        this.set("exchangeText", index.toString() );
    }

    _maxOffer(){
        return this.payoff;
    }

    _computeValue(spot){
        spot = 5 - spot;
        return (6 - spot) * this.value;
    }

    _onPeriodStart() {
        this._subperiodProgress = 0;
        this.lastT = performance.now();
        this._animID = window.requestAnimationFrame(
            this._updateSubperiodProgress.bind(this));
    }
    _onPeriodEnd() {
        window.cancelAnimationFrame(this._animID);
        this._subperiodProgress = 0;
    }
    _updateSubperiodProgress(t) {
        const deltaT = (t - this.lastT);
        const secondsPerSubperiod = this.periodLength / 1;
        this._subperiodProgress = this.periodLength - Math.round(100 * ((deltaT / 1000) / secondsPerSubperiod));
        this._animID = window.requestAnimationFrame(
            this._updateSubperiodProgress.bind(this));
    }

    _timeRemainingPeriod() {
        if((this.periodLength - this.now ) > 0) {
            return this.periodLength - (this.now );
        }
        else {
            return 0;
        }
    }
    _showOffer(){
        return this.swapMethod == 'TL';
    }
    _handleSwapEvent(event){
        console.log(event.detail.payload);
        let playerDecision = event.detail.payload;
        if(playerDecision['type'] == 'request' && playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup)){
            console.log("request event");
            let request = {
                'position': playerDecision['senderPosition'] + 1,
                'offer': playerDecision['offer'],
                'message':playerDecision['message'],
            }
            this.push('requests', request);
            console.log(this.requests);
        }
        if(playerDecision['type'] == 'cancel' && playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup)){
            console.log("Cancel Event");
            let newRequests = [];
            for(let i = 0; i < this.requests.length; i++){
                console.log(this.requests[i]['position'])
                console.log(playerDecision['senderPosition']+ 1)
                if ((this.requests[i]['position']) != (playerDecision['senderPosition']+ 1)){
                    newRequests.push(this.requests[i]);
                }

            }
            console.log(newRequests);
            this.set('requests', newRequests);
        }
        if(playerDecision['type'] == 'accept'){
            console.log(this.requests);
            let newRequests = [];
            if(playerDecision['senderID'] != parseInt(this.$.constants.idInGroup) && playerDecision['receiverID'] != parseInt(this.$.constants.idInGroup)){
                for(let i = 0; i < this.requests.length; i++){
                    console.log(this.requests[i])
                    if (this.requests[i]['position'] - 1 != playerDecision['senderPosition']){
                        newRequests.push(this.requests[i]);
                    }

                }
            } 
            
            this.set('requests', newRequests);
            console.log(this.requests);
            let newQueueList = [];
            for(let i = 0; i < this.queueList.length; i++){
                newQueueList[i] = this.queueList[i];
            }

            let sIndex = this.queueList.indexOf(playerDecision['senderID']);
            let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
            newQueueList[sIndex] = playerDecision['receiverID'];
            newQueueList[rIndex] = playerDecision['senderID'];
            if(playerDecision['senderID'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', rIndex);
            }
            if(playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup)){
                this.set('myPosition', sIndex);
            }
            
            this.set('queueList', newQueueList);
            console.log(this.queueList);
            if(playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) || this.currentRequestPartner == playerDecision['senderID']){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.set("exchangeText", "None" );
            }
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                let newPayoff = this.payoff - playerDecision['offer'];
                this.set("payoff", newPayoff);
            }
            
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                let historyVector =[ rIndex + 1, sIndex + 1, -1 *playerDecision['offer'] ];
                this.push('history', historyVector);
            }

            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                let historyVector =[ sIndex + 1, rIndex+ 1,  playerDecision['offer'] ];
                this.push('history', historyVector);
            }
            
        }
        if(playerDecision['type'] == 'reject'){
            if( playerDecision['receiverID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);

                let rIndex = this.queueList.indexOf(playerDecision['receiverID']);
                let historyVector =[ rIndex + 1, rIndex+ 1,  'REJECTED' ];
                this.push('history', historyVector);
            }
            if( playerDecision['senderID'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);

                let sIndex = this.queueList.indexOf(playerDecision['senderID']);
                let historyVector =[ sIndex + 1, sIndex+ 1,  'REJECTED' ];
                this.push('history', historyVector);
            }
        }
    }
    
    _handlerequest(){
        console.log("request");
        if(this.$.exchangeText.textContent == "None"){
            alert("Select a player!");
            return;
        }
        let exchangePlayerIndex = parseInt(this.$.exchangeText.textContent) - 1;
        let exchangePlayer = this.queueList[exchangePlayerIndex];
        
        if(exchangePlayerIndex > this.myPosition){
            alert("This Player is behind you!");
            return;
        }
        if(exchangePlayer == parseInt(this.$.constants.idInGroup)){
            alert("This Player is you!");
            return;
        }
        if(this._showOffer()) {
            if(this.shadowRoot.querySelector('#offer').value == ""){
                alert("Input an offer");
                return;
            }
            if(parseInt(this.shadowRoot.querySelector('#offer').value) > this.payoff){
                alert("You don't have enough points");
                return;
            }
        }
        
        this.set("requestSent", true);
        this.set('currentRequestPartner', exchangePlayer);
        let newRequest = {
            'channel': 'incoming',
            'type': 'request',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': exchangePlayer,
            'receiverPosition': exchangePlayerIndex,
            
        };
        if(this.messaging && (this.shadowRoot.querySelector('#message').value != "" || this.shadowRoot.querySelector('#message').value != " ")){
            newRequest['message'] = this.shadowRoot.querySelector('#message').value;
        }else{
            newRequest['message'] = "No Message";
        }
        if(this._showOffer()){
            let offer = parseInt(this.shadowRoot.querySelector('#offer').value);
            //this.shadowRoot.querySelector('#offerText').textContent = this.shadowRoot.querySelector('#offer').value;
            newRequest['offer'] = offer;
        } else{
            newRequest['offer'] = 0;
        }
        this.$.channel.send(newRequest);
    }
    _handlecancel(){
        console.log("cancel");
        this.set("requestSent", false);

        if(this._showOffer()){
            //this.$.offerText.textContent = ' ';
            //this.shadowRoot.querySelector('#offerText').textContent = ' ';
        }

        let exchangePlayer = this.currentRequestPartner;
        this.set("exchangeText", "None");
        let newRequest = {
            'channel': 'incoming',
            'type': 'cancel',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': exchangePlayer,
            'receiverPosition': this.queueList.indexOf(exchangePlayer),
            'offer': 0,
        };
        
        this.$.channel.send(newRequest);
    }
    _handleaccept(e) {
        console.log("accept");
        var requestsVector = e.model.requestsVector;
        
        let newRequest = {
            'channel': 'incoming',
            'type': 'accept',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': this.queueList[parseInt(requestsVector['position']-1)],
            'receiverPosition': parseInt(requestsVector['position'])- 1,
        };
        this.set("requestSent", false);
        this.set("exchangeText", "None" );

        
        if(this._showOffer()){
            let offer = parseInt(requestsVector['offer']);
            newRequest['offer'] = offer;
            //this.shadowRoot.querySelector('#offerText').textContent = ' ';
            let newPayoff = this.payoff + offer;
            this.set("payoff", newPayoff);
        } else{
            newRequest['offer'] = 0;
        }
        console.log(newRequest);
        this.$.channel.send(newRequest);
    }
    _handlereject(e) {
        console.log("reject");
        var requestsVector = e.model.requestsVector;

        let newRequests = [];
        for(let i = 0; i < this.requests.length; i++){
            console.log(this.requests[i])
            if (this.requests[i]['position']  != requestsVector['position']){
                newRequests.push(this.requests[i]);
            }
        }
        this.set('requests', newRequests);

        let newRequest = {
            'channel': 'incoming',
            'type': 'reject',
            'senderID': parseInt(this.$.constants.idInGroup),
            'senderPosition': this.myPosition,
            'receiverID': parseInt(this.queueList[requestsVector['position']-1]),
            'receiverPosition': parseInt(requestsVector['position']) - 1,
            'offer': 0,
        };
        console.log(newRequest);
        this.$.channel.send(newRequest);
    }
}

window.customElements.define('leeps-queue', LeepsQueue);
import * as autl from './AppUtl.js';

/////////////////////////////////////////////////////////////////////
// ConfigWsprController
/////////////////////////////////////////////////////////////////////

export class ConfigWsprController
{
    Configure(cfg)
    {
        this.dbg  = cfg.dbg;
        this.conn = cfg.conn;

        this.dom = {};
        this.dom.band       = document.getElementById(cfg.idBand);
        this.dom.channel    = document.getElementById(cfg.idChannel);
        this.dom.callsign   = document.getElementById(cfg.idCallsign);
        this.dom.saveButton = document.getElementById(cfg.idSaveButton);

        // event handling
        this.dom.saveButton.addEventListener("click", e => {
            this.Disable();

            this.conn.Send({
                type: "REQ_SET_WSPR_CONFIG",
                band: this.dom.band.value.trim(),
                channel: this.dom.channel.value.trim(),
                callsign: this.ds.callsign.GetValue(),
            });
        });

        // state keeping
        this.ds = {};
        this.ds.band = new autl.DomState({
            dom: this.dom.band,
            defaultValue: this.dom.band.value,
        });
        this.ds.channel = new autl.DomState({
            dom: this.dom.channel,
        });
        this.ds.callsign = new autl.DomState({
            dom: this.dom.callsign,
        });

        // set initial state
        this.OnDisconnected();
    }

    Disable()
    {
        this.ds.band.Disable();
        this.ds.channel.Disable();
        this.ds.callsign.Disable();
        this.dom.saveButton.disabled = true;
    }
    
    Enable()
    {
        this.ds.band.Enable();
        this.ds.channel.Enable();
        this.ds.callsign.Enable();
        this.dom.saveButton.disabled = false;
    }

    SetValueToDefault()
    {
        this.ds.band.SetValueToDefault();
        this.ds.channel.SetValueToDefault();
        this.ds.callsign.SetValueToDefault();
    }

    SaveValueBaseline()
    {
        this.ds.band.SaveValueBaseline();
        this.ds.channel.SaveValueBaseline();
        this.ds.callsign.SaveValueBaseline();
    }

    GetMessageTypeMapList()
    {
        return [
            {
                msgType: "REP_GET_WSPR_CONFIG",
                cbFn : (msg) => { this.OnMessageRepGetConfig(msg); },
            },
            {
                msgType: "REP_SET_WSPR_CONFIG",
                cbFn : (msg) => { this.OnMessageRepSetConfig(msg); },
            },
        ];
    }

    OnConnected()
    {
        this.conn.Send({
            "type": "REQ_GET_WSPR_CONFIG",
        });
    }

    OnDisconnected()
    {
        this.Disable();

        this.SetValueToDefault();
    }

    OnMessageRepGetConfig(msg)
    {
        this.Enable();

        this.ds.band.SetValueAsBaseline(msg["band"]);
        this.ds.channel.SetValueAsBaseline(msg["channel"]);
        this.ds.callsign.SetValueAsBaseline(msg["callsign"]);

        let callsignOk = msg["callsignOk"];

        if (callsignOk == false)
        {
            this.ds.callsign.SetErrorState();
        }
    }

    OnMessageRepSetConfig(msg)
    {
        this.Enable();

        let ok = msg["ok"];
        let err = msg["err"];

        if (ok)
        {
            autl.ToastOk("Saved");

            this.SaveValueBaseline();
        }
        else
        {
            ToastErr(`Could not save: "${err}"`);
            
            this.ds.callsign.SetErrorState();
        }
    }
}

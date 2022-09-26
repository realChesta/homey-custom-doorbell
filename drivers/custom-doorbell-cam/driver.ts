import Homey, { Device } from 'homey';
import PairSession from 'homey/lib/PairSession';

class DoorbellCamDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('DoorbellCamDriver has been initialized');
  }

  async onPair(session: PairSession): Promise<void> {
    this.log("OnPair!");
    session.setHandler('manual_connection', async (data) => {
      this.log("Pair Session!", data);
      if (!data.snapshot_url || !data.ws_url) {
        throw new Error('No backend URL given!');
      }

      return {
        "name": "Doorbell Camera",
        data:
        {
          "id": data.snapshot_url
        },
        settings:
        {
          "snapshot_url": data.snapshot_url,
          "ws_url": data.ws_url
        }
      };
    });
  }
}

module.exports = DoorbellCamDriver;

import Homey from 'homey';
import { Stream } from 'stream';
const fetch = require('node-fetch');
import WebSocket from 'ws';

class DoorbellCamera extends Homey.Device {
  snapshotImage: Homey.Image | undefined;
  name: string = '';
  err: ((reason: any) => PromiseLike<never>) | null | undefined;
  socket: WebSocket | undefined;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('DoorbellCamera has been initialized');
    await this.updateSnapshot();
    this.socket = new WebSocket(this.getSettings().ws_url)
    this.tryConnect()
  }

  async tryConnect() {
    this.log("Connecting ws...");
    this.socket = new WebSocket(this.getSettings().ws_url)
    this.socket.on('open', () => {
      this.log("ws connected!");
    });

    this.socket.on('message', (data) => {
      const msg = data.toString();
      this.log('received ' + msg);
      switch (msg) {
        case 'motion-start':
          // TODO: set motion-alert to true
          break;

        case 'motion-end':
          // TODO: set motion-alert to false
          break;
      }
    });

    this.socket.on('close', () => {
      this.setUnavailable('WebSocket was disconnected!');
      this.tryConnect();
    });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('DoorbellCamera has been added: ' + this.driver.id);
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: { }, newSettings: { }, changedKeys: { } }): Promise<string | void> {
    this.log('DoorbellCamera settings where changed');
  }


  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('DoorbellCamera was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('DoorbellCamera has been deleted');
  }

  async updateSnapshot() {
    this.snapshotImage = await this.homey.images.createImage();
    this.snapshotImage.setStream(async (stream: Stream) => {

      // let res = await this.doFetch("snapshot");
      const snapUrl = this.getSettings().snapshot_url;
      this.log("Fetching snapshot from " + snapUrl);
      let res = await fetch(snapUrl);
      if (!res.ok) {
        this.log("Fetch snapshot error (" + this.name + "): " + res.statusText, 0);
        this.setWarning(res.statusText);
        throw new Error(res.statusText);
      }

      res.body.pipe(stream);

      stream.on('error', (err) => {
        this.log("Fetch snapshot image error (" + this.name + "): " + err.message, 0);
      });
      stream.on('finish', () => {
        this.log("snapshot Image Updated (" + this.name + ")");
      });
    });

    this.log("Registering snapshot image (" + this.name + ")");
    this.setCameraImage('snapshot', "Snapshot", this.snapshotImage).catch(this.err);
    this.log("registered snapshot image (" + this.name + ")");
  }
}


module.exports = DoorbellCamera;


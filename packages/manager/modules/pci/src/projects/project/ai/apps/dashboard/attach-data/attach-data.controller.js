const DATAGRID_MAX_ITEMS_PER_PAGE = 10;

export default class {
  /* @ngInject */
  constructor(coreConfig, CucCloudMessage) {
    this.CucCloudMessage = CucCloudMessage;

    this.DATAGRID_MAX_ITEMS_PER_PAGE = DATAGRID_MAX_ITEMS_PER_PAGE;
  }

  $onInit() {
    this.trackApps('attached_data', 'page');

    this.messageContainer = 'pci.projects.project.apps.dashboard.attach-data';
    this.loadMessages();
    this.dataStoreVolumes = this.app.spec.volumes.filter(
      ({ dataStore }) => dataStore !== undefined,
    );
    this.publicGitVolumes = this.app.spec.volumes.filter(
      ({ publicGit }) => publicGit !== undefined,
    );
  }

  loadMessages() {
    this.CucCloudMessage.unSubscribe(this.messageContainer);
    this.messageHandler = this.CucCloudMessage.subscribe(
      this.messageContainer,
      {
        onMessage: () => this.refreshMessages(),
      },
    );
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }
}

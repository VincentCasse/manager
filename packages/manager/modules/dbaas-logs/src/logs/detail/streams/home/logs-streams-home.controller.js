import find from 'lodash/find';

export default class LogsStreamsHomeCtrl {
  /* @ngInject */
  constructor(
    $filter,
    $q,
    $state,
    $stateParams,
    $translate,
    LogsConstants,
    LogsStreamsService,
    LogsHomeService,
    CucControllerHelper,
    CucCloudMessage,
    CucUrlHelper,
  ) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.serviceName = this.$stateParams.serviceName;
    this.LogsConstants = LogsConstants;
    this.LogsStreamsService = LogsStreamsService;
    this.LogsHomeService = LogsHomeService;
    this.CucControllerHelper = CucControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.CucUrlHelper = CucUrlHelper;
    this.bytes = $filter('bytes');
    this.initLoaders();
  }

  /**
   * initializes streams object by making API call to get data
   *
   * @memberof LogsStreamsHomeCtrl
   */
  initLoaders() {
    this.retentions = [];
    this.accountDetails = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () =>
        this.LogsHomeService.getAccountDetails(this.serviceName),
    });
    this.streams = this.CucControllerHelper.request.getArrayLoader({
      loaderFunction: () =>
        this.LogsStreamsService.getStreams(this.serviceName),
    });
    this.runLoaders().then(() => {
      this.loadRetentions();
    });
  }

  runLoaders() {
    return this.$q.all([this.accountDetails.load(), this.streams.load()]);
  }

  /**
   * navigates to add stream page
   *
   * @memberof LogsStreamsHomeCtrl
   */
  add() {
    this.$state.go('dbaas-logs.detail.streams.add', {
      serviceName: this.serviceName,
    });
  }

  /**
   * create stream
   *
   * @memberof LogsStreamsHomeCtrl
   */
  create() {
    this.LogsStreamsService.createStream(this.serviceName).then(() =>
      this.initLoaders(),
    );
  }

  /**
   * navigates to edit stream page
   *
   * @param {any} stream
   * @memberof LogsStreamsHomeCtrl
   */
  edit(stream) {
    this.$state.go('dbaas-logs.detail.streams.stream.edit', {
      serviceName: this.serviceName,
      streamId: stream.streamId,
    });
  }

  /**
   * show delete stream confirmation modal
   *
   * @param {any} stream to delete
   * @memberof LogsStreamsHomeCtrl
   */
  showDeleteConfirm(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.CucControllerHelper.modal
      .showDeleteModal({
        titleText: this.$translate.instant('logs_stream_delete_title'),
        textHtml: this.$translate.instant('logs_stream_delete_message', {
          stream: stream.title,
        }),
      })
      .then(() => this.remove(stream));
  }

  /**
   * delete stream
   *
   * @param {any} stream to delete
   * @memberof LogsStreamsHomeCtrl
   */
  remove(stream) {
    this.delete = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () =>
        this.LogsStreamsService.deleteStream(this.serviceName, stream)
          .then(() => this.initLoaders())
          .finally(() => this.CucControllerHelper.scrollPageToTop()),
    });
    this.delete.load();
  }

  /**
   * navigates to the alerts page
   *
   * @param {any} stream, stream for which alerts should be managed
   * @memberof LogsStreamsHomeCtrl
   */
  manageAlerts(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas-logs.detail.streams.stream.alerts', {
      serviceName: this.serviceName,
      streamId: stream.streamId,
    });
  }

  loadRetentions() {
    this.retentions = this.accountDetails.data.clusters
      .map(({ retentions }) => retentions)
      .flat();
  }

  findRetention(stream) {
    return find(
      this.retentions,
      (retention) => retention.retentionId === stream.retentionId,
    );
  }

  retentionInfo(stream) {
    const foundRetention = this.findRetention(stream);
    if (foundRetention?.duration) {
      if (
        foundRetention.duration === this.LogsConstants.RETENTION.FORTY_FIVE_DAYS
      ) {
        // moment convert 45 days to a month and we need to be accurate here
        return this.$translate.instant('streams_45_days');
      }
      return moment.duration(foundRetention.duration).humanize();
    }
    return this.$translate.instant('streams_disk_full');
  }

  /**
   * navigates to the alerts page
   *
   * @param {any} stream, stream for which alerts should be managed
   * @memberof LogsStreamsHomeCtrl
   */
  gotoArchives(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas-logs.detail.streams.stream.archives', {
      serviceName: this.serviceName,
      streamId: stream.streamId,
    });
  }

  /**
   * navigates to follow live stream page
   *
   * @param {any} stream, stream to follow live
   * @memberof LogsStreamsHomeCtrl
   */
  followLive(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas-logs.detail.streams.stream.follow', {
      serviceName: this.serviceName,
      streamId: stream.streamId,
    });
  }

  /**
   * extracts graylog web URL from stream
   *
   * @param {any} stream, stream for which URL needs to be extracted
   * @return {string} graylog url
   * @memberof LogsStreamsHomeCtrl
   */
  openGrayLog(stream) {
    this.LogsStreamsService.getStreamGraylogUrl(this.serviceName, stream).then(
      (url) => {
        window.open(url, '_blank');
      },
    );
  }

  copyToken(stream) {
    this.LogsStreamsService.copyStreamToken(this.serviceName, stream).then(
      () => {
        this.CucControllerHelper.scrollPageToTop();
      },
    );
  }
}

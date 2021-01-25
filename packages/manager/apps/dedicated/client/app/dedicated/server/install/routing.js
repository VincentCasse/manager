export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('app.dedicated.server.install', {
    abstract: true,
    url: '/install',
    resolve: {
      goDashboard: /* @ngInject */ ($state) => () =>
        $state.go(
          'app.dedicated.server.dashboard',
          {},
          {
            reload: true,
          },
        ),

      hardwareSpecifications: /* @ngInject */ (
        dedicatedServerInstall,
        server,
      ) => dedicatedServerInstall.getHardwareSpecifications(server),
    },
  });
};

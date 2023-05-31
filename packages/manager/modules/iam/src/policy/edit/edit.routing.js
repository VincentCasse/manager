export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('iam.editPolicy', {
    url: `/policy/edit/{policy:uuid}`,
    component: 'iamCreatePolicy',
    resolve: {
      breadcrumb: /* @ngInject */ ($translate, policy) =>
        $translate.instant('iam_policy_edit', { policy: policy.name }),

      /**
       * The Policy parameter based on the policy's id
       * @returns {Object|null}
       */
      policy: /* @ngInject */ ($transition$, PolicyService) => {
        const { policy: uuid } = $transition$.params();
        return uuid ? PolicyService.getDetailedPolicy(uuid) : null;
      },
    },
  });
};

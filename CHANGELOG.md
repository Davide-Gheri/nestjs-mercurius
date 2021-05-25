## [0.9.1](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.9.0...0.9.1) (2021-05-25)


### Bug Fixes

* **factory:** return undefined if no validation rules are provided ([326965c](https://github.com/Davide-Gheri/nestjs-mercurius/commit/326965c93d4d7226648bc14f92689acd7c4bf2dd))

# [0.9.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.8.1...0.9.0) (2021-05-11)


### Bug Fixes

* **gateway:** wrong function call on gateway options factory ([675d4e1](https://github.com/Davide-Gheri/nestjs-mercurius/commit/675d4e1673fccaf1cfd8c7770a5035fc02e2f766))
* Fixed import ([9f4b972](https://github.com/Davide-Gheri/nestjs-mercurius/commit/9f4b97203b703096dd788fc3c383007b830aa5dc))

## [0.8.1](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.8.0...0.8.1) (2021-04-13)


### Bug Fixes

* **gateway:** hookservice dependencies ([85f1cf8](https://github.com/Davide-Gheri/nestjs-mercurius/commit/85f1cf81495a419a44cfb295cb724f6b63061518))

# [0.8.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.7.0...0.8.0) (2021-03-23)


### Bug Fixes

* **loader:** correct interface loader inherit ([6e6357f](https://github.com/Davide-Gheri/nestjs-mercurius/commit/6e6357fb0a635a988d6bd6dfeae6eb396acd475a))

# [0.7.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.6.0...0.7.0) (2021-03-17)


### Bug Fixes

* **loader:** remove interface loaders as it breaks resolve type fn ([c3de299](https://github.com/Davide-Gheri/nestjs-mercurius/commit/c3de299ddf8249792f79db9fd4723581c8c1cc61))

# [0.6.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.5.1...0.6.0) (2021-02-23)


### Features

* **hooks:** add mercurius hooks support ([23b4f3a](https://github.com/Davide-Gheri/nestjs-mercurius/commit/23b4f3a670786ab89310653ea9d6549eaaa4bfa9))

## [0.5.1](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.5.0...0.5.1) (2021-02-22)


### Bug Fixes

* removed peer dep typings ([d448836](https://github.com/Davide-Gheri/nestjs-mercurius/commit/d448836a0d42293be102c01358cdcc74e8cb5684))

# [0.5.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.5.0-beta.1...0.5.0) (2021-02-22)

* Merge pull request #18 from Davide-Gheri/feature/interface-loaders (8d92191)
* Merge branch 'master' into feature/interface-loaders (ea2f035)
* Merge pull request #19 from Davide-Gheri/dependabot/npm_and_yarn/eslint-config-prettier-8.0.0 (79529a4)
* Merge pull request #22 from Davide-Gheri/dependabot/npm_and_yarn/release-it-14.4.1 (7e92d1d)
* Merge pull request #21 from Davide-Gheri/dependabot/npm_and_yarn/mercurius-7.1.0 (f14cb3f)
* Merge pull request #20 from Davide-Gheri/dependabot/npm_and_yarn/husky-5.1.0 (5f3cbd7)
* fix: prettier (0c0891b)
* chore(deps-dev): bump release-it from 14.4.0 to 14.4.1 (1a52dd1)
* chore(deps-dev): bump mercurius from 7.0.0 to 7.1.0 (c517821)
* chore(deps-dev): bump husky from 5.0.9 to 5.1.0 (dd36ef3)
* chore(deps-dev): bump eslint-config-prettier from 7.2.0 to 8.0.0 (804078d)
* test(loaders): interface defined loader (1f3b6c4)
* feat(loaders): types inherits interface defined loaders (d47e232)
* chore: removed unused mercurius param type enum (53aeddf)
* Update README.md (7b7083b)
* Merge branch 'master' of github.com:Davide-Gheri/nestjs-mercurius (7e31570)
* chore: moved optional deps to peer (7fe4bb7)
* Merge pull request #17 from Davide-Gheri/add-license-1 (6d62a0c)
* Create CODE_OF_CONDUCT.md (7503211)
* Create LICENSE (52e583c)

# [0.5.0-beta.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.4.0...0.5.0-beta.0) (2021-02-19)


### Bug Fixes

* merge error ([23d0ced](https://github.com/Davide-Gheri/nestjs-mercurius/commit/23d0cedc728ee9218cdf8463617ea8445c4493eb))


### Features

* **federation:** define federation service ([688cea2](https://github.com/Davide-Gheri/nestjs-mercurius/commit/688cea22edb6bdc1e4e0de049005f1737ea83563))
* **federation:** gateway module ([5c835f0](https://github.com/Davide-Gheri/nestjs-mercurius/commit/5c835f067cd996c9a6faab5e026441ccde38cb1e))
* **federation:** need a custom graphql factory ([e2b1bf8](https://github.com/Davide-Gheri/nestjs-mercurius/commit/e2b1bf874408270ef8cd8a06a711a866ed9e7bab))
* **federation:** need a custom graphql factory ([989aace](https://github.com/Davide-Gheri/nestjs-mercurius/commit/989aace729987e437793f699eda81f41912c9ea4))

# [0.4.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.3.0...0.4.0) (2021-02-19)


### Features

* **pubsub:** global pubsub host' ([064640b](https://github.com/Davide-Gheri/nestjs-mercurius/commit/064640b5c64a68c21456810864bfcf59d7c2e76c))

# [0.3.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.2.0...0.3.0) (2021-02-18)


### Features

* add opts object to loaders ([2a94abf](https://github.com/Davide-Gheri/nestjs-mercurius/commit/2a94abfd6bca0f0f6b16a96da0d19e3b09836c4f))
* ResolveLoader accepts optional opts object ([5ad6dfe](https://github.com/Davide-Gheri/nestjs-mercurius/commit/5ad6dfeb45b9213c1fbc041fe0be236d679ba32f))

# [0.2.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.1.0...0.2.0) (2021-02-18)


### Features

* loader middleware, testing unions/enums/interfaces ([35e25e3](https://github.com/Davide-Gheri/nestjs-mercurius/commit/35e25e384a8951a80816ada6f72ad0c3d323a56b))

# [0.1.0](https://github.com/Davide-Gheri/nestjs-mercurius/compare/0.1.0-beta.1...0.1.0) (2021-02-17)

* test: resolvers merging with third party resolvers (58184dc)
* Merge pull request #4 from Davide-Gheri/feature/query-complexity (881952f)
* ci: run only on 1 os (5b740c4)
* ci: github workflow on push and pr (244d6a2)
* Merge pull request #3 from Davide-Gheri/feature/enhancers (7c2a57b)
* test: testing scalars (3c05f39)
* feat: validation rules (4b50148)
* Merge branch 'feature/enhancers' of github.com:Davide-Gheri/nestjs-mercurius into feature/enhancers (3c586b2)
* feat: nestjs enhanchers (guards, filters, interceptors) (888439b)
* feat: nestjs enhanchers (guards, filters, interceptors) (71bb07b)
* refactor(loader): simplified loader decorators (ace3606)

# 0.1.0-beta.0 (2021-02-14)


### Features

* support Subscriptions ([235e5ed](https://github.com/Davide-Gheri/nestjs-mercurius/commit/235e5ed6bd0ea78082a742bcc5bda07a83c126ed))
* support Subscriptions ([aaeb124](https://github.com/Davide-Gheri/nestjs-mercurius/commit/aaeb12494e1012ed2b143e90b0c6a0fc7922f3d6))
* upload ([450d997](https://github.com/Davide-Gheri/nestjs-mercurius/commit/450d99798a3f663dbd7a9a1d4651e7652595722c))


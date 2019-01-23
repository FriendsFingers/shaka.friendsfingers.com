/* global __DEFAULT_NETWORK__, __TOKEN_ADDRESS__, __FAUCET_ADDESS__ */

import TokenArtifact from '../abi/BaseToken';
import FaucetArtifact from '../abi/TokenFaucet';

export default {
  data () {
    return {
      legacy: false,
      web3: null,
      web3Provider: null,
      zeroAddress: '0x0000000000000000000000000000000000000000',
      metamask: {
        address: '',
        installed: false,
        netId: null,
      },
      network: {
        default: __DEFAULT_NETWORK__,
        current: null,
        map: {
          1: 'mainnet',
          3: 'ropsten',
          4: 'rinkeby',
          42: 'kovan',
        },
        list: {
          mainnet: {
            web3Provider: 'https://mainnet.infura.io/v3/ae4c006a38f04839a414b7a8ef22c29e',
            etherscanLink: 'https://etherscan.io',
            id: '1',
            name: 'Main Ethereum Network',
          },
          ropsten: {
            web3Provider: 'https://ropsten.infura.io/v3/ae4c006a38f04839a414b7a8ef22c29e',
            etherscanLink: 'https://ropsten.etherscan.io',
            id: '3',
            name: 'Ropsten Test Network',
          },
          rinkeby: {
            web3Provider: 'https://rinkeby.infura.io/v3/ae4c006a38f04839a414b7a8ef22c29e',
            etherscanLink: 'https://rinkeby.etherscan.io',
            id: '4',
            name: 'Rinkeby Test Network',
          },
          kovan: {
            web3Provider: 'https://kovan.infura.io/v3/ae4c006a38f04839a414b7a8ef22c29e',
            etherscanLink: 'https://kovan.etherscan.io',
            id: '42',
            name: 'Kovan Test Network',
          },
        },
      },
      contracts: {
        token: null,
        market: null,
      },
      instances: {
        token: null,
        market: null,
      },
    };
  },
  methods: {
    initWeb3 (network, checkWeb3) {
      if (!this.network.list.hasOwnProperty(network)) {
        throw new Error(`Failed initializing network ${network}. Allowed values are mainnet, ropsten and rinkeby.`);
      }

      return new Promise((resolve) => {
        if (checkWeb3 && (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined')) {
          if (window.ethereum) {
            console.log('injected web3');
            this.web3Provider = window.ethereum;
          } else {
            console.log('injected web3 (legacy)');
            this.web3Provider = window.web3.currentProvider;
            this.legacy = true;
          }

          this.web3 = new Web3(this.web3Provider);
          this.metamask.installed = true;
          this.web3.version.getNetwork(async (err, netId) => {
            if (err) {
              console.log(err);
            }
            this.metamask.netId = netId;
            if (netId !== this.network.list[network].id) {
              this.network.current = this.network.list[this.network.map[netId]];
              await this.initWeb3(network, false);
            }
            this.metamask.address = this.web3.eth.accounts[0];
            resolve();
          });
        } else {
          console.log('provided web3');
          this.network.current = this.network.list[network];
          this.web3Provider = new Web3.providers.HttpProvider(this.network.list[network].web3Provider);
          this.web3 = new Web3(this.web3Provider);

          resolve();
        }
      });
    },
    initContracts () {
      this.contracts.token = this.web3.eth.contract(TokenArtifact.abi);
      this.instances.token = this.contracts.token.at(__TOKEN_ADDRESS__);
      this.contracts.faucet = this.web3.eth.contract(FaucetArtifact.abi);
      this.instances.faucet = this.contracts.faucet.at(__FAUCET_ADDESS__);

      this.ready();
    },
    async connect () {
      try {
        if (!this.legacy) {
          await this.web3Provider.enable();
        }

        this.metamask.address = this.web3.eth.accounts[0];
      } catch (e) {
        console.log(e);
        alert('Cannot connect. Please verify that you have MetaMask installed and unlocked.');
      }
    },
    ready () {

    },
  },
};

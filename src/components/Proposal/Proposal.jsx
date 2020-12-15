/* IMPORTS */
// Config
import React, { Component } from "react";
import ApolloClient, { gql, InMemoryCache } from "apollo-boost";
// Components
import { config } from "../../config";
import { defaults } from "lib/const";
import { abiLibrary } from "../../lib/abi";
import { Modal } from "react-bootstrap";
import { Loader } from "rimble-ui";
// import Switch from "react-input-switch";
import "./style.css";

import Details from "./Details"
import Applicant from "./Applicant"
import SharesRequested from "./SharesRequested"
import TributeOffered from "./TributeOffered"
import PaymentRequested from "./PaymentRequested"
import MemberToKick from "./MemberToKick"
import TokenToWhitelist from "./TokenToWhitelist"

// // Forms
// import WhitelistProposal from "./WhitelistProposal";
// import SubmitProposal from "./SubmitProposal";
// import GuildKickProposal from "./GuildKickProposal";

// Functions
import { walletError, notMember, _invalidAddress } from "components/Choice/messages";

const Web3 = require("web3");
const molochClient = new ApolloClient({
    uri: config.graph.moloch,
    cache: new InMemoryCache(),
});
const tokensClient = new ApolloClient({
    uri: config.graph.tokens,
    cache: new InMemoryCache(),
});

const TYPES = [
    {key: 'isNewMember', title: 'Membership'},
    {key: 'isFunding', title: 'Funding'},
    {key: 'isTrade', title: 'Trade'},
    {key: 'isGuildKick', title: 'Guild Kick'},
    {key: 'isWhitelist', title: 'Whitelist'}
]

const INITIAL_STATE = {
    /* Proposal type */
    isNewMember: false,
    isFunding: true,
    isTrade: false,
    isGuildKick: false,
    isWhitelist: false,
    isLoading: false,
    header: 'Funding',
    /* Contract information */
    daoName: "",
    version: "",
    availableTokens: [],
    ERC20Tokens: [],
    /* Form inputs */
    applicant: { address: defaults.EMPTY, validated: false },
    sharesRequested: 0,
    lootRequested: 0,
    tributeOffered: 0,
    tributeToken: defaults.EMPTY,
    paymentRequested: 0,
    paymentToken: defaults.EMPTY,
    tokenToWhitelist:defaults.EMPTY,
    memberToKick: { address: defaults.EMPTY, validated: false },
    /* Details to compose */
    title: "",
    description: "",
    link: "",
};

const isAddress = async (
    address,
) => {
    const web3 = await new Web3("ws://localhost:8545");
    return await web3.utils.isAddress(address)
}

const isMember = async (
    memberAddress,
    /*Contract information*/
    library,
    version,
    contractAddress
) => {
    console.log('MEMBER ADDRESS: ', memberAddress)
    const web3 = await new Web3("ws://localhost:8545");
    
    const isAddress = await web3.utils.isAddress(memberAddress)
    if (!isAddress) return false
    
    const dao = await new web3.eth.Contract(
        library[version === "2" ? "moloch2" : "moloch"],
        contractAddress
    );
    
    const response = await dao.methods
        .members(web3.utils.toChecksumAddress(memberAddress))
        .call({}, (err, res) => {
            if (err) {
                walletError(err);
                return err;
            }
            return res;
        });
  
    return response.exists;
};

const submitProposal = async (
    /*Wallet information*/
    user,
    /*Contract information*/
    library,
    version,
    address,
    /*Proposal information*/
    applicantAddress,
    sharesRequested,
    lootRequested,
    tributeOffered,
    tributeToken,
    paymentRequested,
    paymentToken,
    details
) => {
    const web3 = new Web3("ws://localhost:8545");
    const daoContract = await new web3.eth.Contract(
        library[version === "2" ? "moloch2" : "moloch"],
        address
    );

    // dao membership
    if (version === "1" && !(await isMember(user, library, version))) {
        return notMember();
    }

    const proposal = version === "2"
        ? await daoContract.methods.submitProposal(
            applicantAddress,
            sharesRequested,
            lootRequested,
            tributeOffered,
            tributeToken,
            paymentRequested,
            paymentToken,
            details
        )
        : await daoContract.methods.submitProposal(
            applicantAddress,
            tributeToken,
            sharesRequested,
            `{"title":${details.title},"description":${details.description},"link":${details.link}}`
        );

    const estimatedGas = await proposal.estimateGas().then(price => price);

    const receipt = await proposal
        .send({ from: user, gas: estimatedGas })
        .on("receipt", receipt => {
            console.log("RECEIPT: ", receipt);
            return receipt;
        });

    return receipt
};

const submitWhitelistProposal = async (
    /*Wallet information*/
    user,
    /*Contract information*/
    library,
    version,
    address,
    /*Proposal information*/
    tokenToWhitelist,
    details
) => {
    const web3 = new Web3("ws://localhost:8545");
    const daoContract = await new web3.eth.Contract(
        library[version === "2" ? "moloch2" : "moloch"],
        address
    );

    if (tokenToWhitelist === "0x0") return

    const proposal = await daoContract.methods.submitWhitelistProposal(
        tokenToWhitelist,
        details
    );
    const estimatedGas = await proposal.estimateGas().then(price => price);

    const receipt = await proposal
        .send({ from: user, gas: estimatedGas })
        .on("receipt", receipt => {
        console.log("RECEIPT: ", receipt);
        return receipt;
        });

    return receipt
};

const submitGuildKickProposal = async (
    /*Wallet information*/
    user,
    /*Contract information*/
    library,
    version,
    address,
    /*Proposal information*/
    memberToKick,
    details
) => {
    const web3 = new Web3("ws://localhost:8545");
    const daoContract = await new web3.eth.Contract(
        library[version === "2" ? "moloch2" : "moloch"],
        address
    );

    const proposal = await daoContract.methods.submitGuildKickProposal(
        memberToKick,
        details
    );
    const estimatedGas = await proposal.estimateGas().then(price => price);

    const receipt = await proposal
        .send({ from: user, gas: estimatedGas })
        .on("receipt", receipt => {
            console.log("RECEIPT: ", receipt);
            return receipt;
        });

    return receipt
};

export default class Proposal extends Component {
    state = { ... INITIAL_STATE };

    // Dao & tokens setting
    setDao = (address) => {
        molochClient
        .query({
            query: gql `{
                    moloches( where: {id: "${address}"} ) {
                        title
                        version
                        tokens {
                            tokenAddress
                            symbol
                        }
                    }
                }`,
        })
        .then((res) =>
            this.setState({
                daoName: res.data.moloches[0].title,
                version: res.data.moloches[0].version,
                availableTokens: res.data.moloches[0].tokens,
                tributeToken: res.data.moloches[0].tokens[0].tokenAddress,
                paymentToken: res.data.moloches[0].tokens[0].tokenAddress,
            })
        );
    };

    setTokens = () => {
        tokensClient
        .query({
            query: gql `{
                tokens {
                    address
                    name
                    symbol
                }
            }`,
        })
        .then((res) =>
            this.setState({
                ERC20Tokens: res.data.tokens.filter(token => token != this.state.availableTokens)
            })
        );
    };
    
    setType = (type) => {
        TYPES.map(t => {
            if(t.key == type && this.state[t.key] === false) this.setState({[type]: true, header: t.title})
            if(t.key != type && this.state[t.key] === true) this.setState({[t.key]: false})
            }
        )
    }

    // Component life cycle
    resetState = (e) => {
        if (e) e.preventDefault();
        this.setState({
            isLoading: false,
            applicant: { address: this.props.user, validated: true },
            sharesRequested: 0,
            lootRequested: 0,
            tributeOffered: 0,
            tributeToken: defaults.EMPTY,
            paymentRequested: 0,
            paymentToken: defaults.EMPTY,
            title: "",
            description: "",
            link: "",
        });
    };

    componentDidMount() {
        this.setDao(this.props.address);
        this.setState({ applicant: { address: this.props.user, validated: true } });
        this.setTokens();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.address !== this.props.address) {
            this.setDao(this.props.address);
            this.setTokens()
        };
        if (prevProps.user !== this.props.user)
        this.setState({ applicant: { address: this.props.user, validated: true } });
    }

    // Handlers
    handleSubmitProposal = async (e) => {
        e.preventDefault();

        const { version, applicant, sharesRequested, lootRequested, tributeOffered,tributeToken, paymentRequested, paymentToken, title, description, link } = this.state;
        const { user, address } = this.props;

        this.setState({ isLoading: true });

        const receipt = await submitProposal(
            /*Wallet information*/
            user,
            /*Contract information*/
            abiLibrary,
            version,
            address,
            /*Proposal information*/
            applicant.address,
            sharesRequested,
            lootRequested,
            tributeOffered,
            tributeToken,
            paymentRequested,
            paymentToken,
            /* Details JSON */
            { title, description, link }
        );

        this.resetState();
        this.props.onHide();
    };

    handleSubmitWhitelistProposal = async (e) => {
        e.preventDefault();
        this.setState({ isLoading: true });

        const { version, title, description, link, tokenToWhitelist } = this.state;
        const { user, address } = this.props;

        const receipt = await submitWhitelistProposal(
            /*Wallet information*/
            user,
            /*Contract information*/
            abiLibrary,
            version,
            address,
            /* Details JSON */
            tokenToWhitelist,
            { title, description, link }
        );

        this.resetState();
        this.props.onHide();
    };

    handleSubmitGuildKickProposal = async (e) => {
        e.preventDefault();
        this.setState({ isLoading: true });

        const { version, title, description, link, memberToKick } = this.state;
        const { user, address } = this.props;

        const receipt = await submitGuildKickProposal(
            /*Wallet information*/
            user,
            /*Contract information*/
            abiLibrary,
            version,
            address,
            /*Proposal information*/
            memberToKick.address,
            /* Details JSON */
            { title, description, link }
        );

        this.resetState();
        this.props.onHide();
    };

    handleChanges = async(e) => {
        const name = e.target.name
        if (name === 'aplicant' || name === 'memberToKick') {
            const address = e.target.value
            const validated = await name === 'memberToKick' ? isMember(address, abiLibrary, this.state.version, this.props.address) : isAddress(address)
            this.setState({[name]: {address, validated}})
        } else {
            const value = e.target.type === "number" && e.target.value < 0 ? 0 : e.target.value
            this.setState({[name]: value})
        }
    }

  render() {
      const { isNewMember, isFunding, isTrade, isGuildKick, isWhitelist, header, availableTokens, ERC20Tokens, applicant, sharesRequested, lootRequested,tributeOffered, tributeToken, paymentRequested, paymentToken, tokenToWhitelist, memberToKick, title, description, link } = this.state
      const { show, onHide } = this.props

    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Body className="modal">
          <div className="container">
            <div className="header">
              <img src="/static/media/flag.44f0a516.svg" />
              <h4>{this.state.daoName}</h4>
            </div>
            <div className="formContainer">
                <div className="title">
                <h2>{`New ${header} Proposal`}</h2>
                </div>
                <div className="switch">
                    {TYPES.map((t,i) => 
                        <button
                            key={i}
                            className={`switchButton ${this.state[t.key] ? 'switched' : null}`}
                            onClick={() => this.setType(t.key)}
                        >{t.title}</button>)}
                </div>
                <form className="form">
                    <Details title={title} description={description} link={link} handleChanges={this.handleChanges} />
                    { isFunding 
                        ? <Applicant applicant={applicant} handleChanges={this.handleChanges} /> 
                        : null 
                    }
                    { isFunding || isNewMember 
                        ? <SharesRequested sharesRequested={sharesRequested} lootRequested={lootRequested} handleChanges={this.handleChanges} />
                        : null
                    }
                    { isFunding || isNewMember || isTrade
                        ?<TributeOffered availableTokens={availableTokens} tributeOffered={tributeOffered} tributeToken={tributeToken} handleChanges ={this.handleChanges}/>
                        : null
                    }
                    { isFunding || isTrade
                        ?<PaymentRequested availableTokens={availableTokens} paymentRequested={paymentRequested} paymentToken={paymentToken} handleChanges ={this.handleChanges}/>
                        : null
                    }
                    { isGuildKick
                        ?<MemberToKick memberToKick={memberToKick} paymentRequested={paymentRequested} handleChanges ={this.handleChanges}/>
                        : null
                    }
                    { isWhitelist
                        ?<TokenToWhitelist tokenToWhitelist={tokenToWhitelist} ERC20Tokens={ERC20Tokens} handleChanges ={this.handleChanges}/>
                        : null
                    }
                    
                    <div className="section end">
                        <button className="submit clear" onClick={this.resetState}>
                            Clear
                        </button>
                        {this.state.isLoading ? (
                            <Loader size="30px" />
                        ) : (
                            <button
                            disabled={false} 
                            className="submit" 
                            onClick={e => {
                                if(isGuildKick) this.handleSubmitGuildKickProposal(e)
                                if(isWhitelist) this.handleSubmitWhitelistProposal(e)
                                if(isNewMember || isFunding || isTrade) this.handleSubmitProposal(e)
                            }}>
                                Submit proposal
                            </button>
                        )}
                    </div>
                </form>
            </div>
          </div>
            {/* <div className="switch">
              <h2>Whitelist Proposal?</h2>
              <Switch
                value={this.state.whitelist}
                on="Yes"
                off="No"
                onChange={(whitelist) => {
                  this.setState({ whitelist, guildkick: "No" });
                }}
              />

              <h2>GuildKick Proposal?</h2>
              <Switch
                value={this.state.guildkick}
                on="Yes"
                off="No"
                onChange={(guildkick) => this.setState({ guildkick, whitelist: "No" })}
              />
            </div>

            {this.state.whitelist === "Yes" ? (
              <WhitelistProposal
                state={this.state}
                handleChanges={this.handleChanges}
                handleSubmit={this.handleSubmitWhitelist}
              />
            ) : null}

            {this.state.guildkick === "Yes" ? (
              <GuildKickProposal
                state={this.state}
                handleChanges={this.handleChanges}
                handleSubmit={this.handleSubmitKickProposal}
              />
            ) : null}

            {this.state.whitelist === "No" && this.state.guildkick === "No" ? (
              <SubmitProposal
                state={this.state}
                handleChanges={this.handleChanges}
                handleSubmit={this.handleSubmit}
                resetState={this.resetState}
              />
            ) : null} */}
        </Modal.Body>
      </Modal>
    );
  }
}

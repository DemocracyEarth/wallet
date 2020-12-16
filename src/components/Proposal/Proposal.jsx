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
// Forms
import Details from "./Details"
import Applicant from "./Applicant"
import SharesRequested from "./SharesRequested"
import TributeOffered from "./TributeOffered"
import PaymentRequested from "./PaymentRequested"
import MemberToKick from "./MemberToKick"
import TokenToWhitelist from "./TokenToWhitelist"
import "./style.css";
// Functions
import {isAddress, isMember, notNull, submitProposal, submitWhitelistProposal, submitGuildKickProposal} from './utils'

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
    header: TYPES[0].title,
    isNewMember: true,
    isFunding: false,
    isTrade: false,
    isGuildKick: false,
    isWhitelist: false,
    isLoading: false,
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

export default class Proposal extends Component {
    state = { ...INITIAL_STATE };

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
                ERC20Tokens: res.data.tokens.filter(token => token !== this.state.availableTokens)
            })
        );
    };
    
    setType = (type) => TYPES.forEach(t => {
        if(t.key === type && this.state[t.key] === false) this.setState({[type]: true, header: t.title})
        if(t.key !== type && this.state[t.key] === true) this.setState({[t.key]: false})
    })
    
    // Component life cycle
    resetState = (e) => {
        if (e) e.preventDefault();
        this.setState({
            isLoading: false,
            applicant: {address: this.props.user, validated: true},
            sharesRequested: 0,
            lootRequested: 0,
            tributeOffered: 0,
            tributeToken: this.state.availableTokens[0].tokenAddress,
            paymentRequested: 0,
            paymentToken: this.state.availableTokens[0].tokenAddress,
            tokenToWhitelist:defaults.EMPTY,
            memberToKick: {address: defaults.EMPTY, validated: false},
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
        
        // validations
        if(!notNull(title, description, link)) return
        if(!applicant.validated) return

        this.setState({ isLoading: true });

        await submitProposal(/*Wallet information*/ user, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ applicant.address, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested,paymentToken, /* Details JSON */ { title, description, link });

        this.resetState();
        this.props.onHide();
    };

    handleSubmitWhitelistProposal = async (e) => {
        e.preventDefault();
        const { version, title, description, link, tokenToWhitelist } = this.state;
        const { user, address } = this.props;
        
        // validations
        if(!notNull(title, description, link, tokenToWhitelist)) return
        
        this.setState({ isLoading: true });

        await submitWhitelistProposal(/*Wallet information*/ user, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ tokenToWhitelist, /* Details JSON */ { title, description, link });

        this.resetState();
        this.props.onHide();
    };

    handleSubmitGuildKickProposal = async (e) => {
        e.preventDefault();
        const { version, title, description, link, memberToKick } = this.state;
        const { user, address } = this.props;
        
        // validations
        if(!notNull(title, description, link)) return
        if(!memberToKick.validated) return
        
        this.setState({ isLoading: true });

        await submitGuildKickProposal(/*Wallet information*/ user, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ memberToKick.address, /* Details JSON */ { title, description, link });

        this.resetState();
        this.props.onHide();
    };

    handleChanges = async(e) => {
        const name = e.target.name
        let value = e.target.value
        let validated
        if (name === 'applicant') {
            validated = await isAddress(value) 
            value = {address: value, validated} 
        } else if (e.target.name === 'memberToKick') {
            validated = await isMember(value, abiLibrary, this.state.version, this.props.address)
            value = {address: value, validated} 
        } else {
            value = e.target.type === "number" && (e.target.value < 0 || e.target.value === '') ? 0 : value
        }
        this.setState({[name]: value})
    }

  render() {
      const { isNewMember, isFunding, isTrade, isGuildKick, isWhitelist, header, version, availableTokens, ERC20Tokens, applicant, sharesRequested, lootRequested,tributeOffered, tributeToken, paymentRequested, paymentToken, tokenToWhitelist, memberToKick, title, description, link } = this.state
      const { show, onHide } = this.props

    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Body className="modal">
          <div className="container">
            <div className="header">
                <div className="dao">
                    <img src="/static/media/flag.44f0a516.svg" alt="flag"/>
                    <h4 onClick={()=>onHide()}>{this.state.daoName}</h4>
                </div>
              <img onClick={()=>onHide()} src="/static/media/rejected.973d249d.svg" alt="close"></img>
            </div>
            <div className="formContainer">
                <div className="title">
                    <h2>{`New ${header} Proposal`}<span>{` (v${version})`}</span></h2>
                </div>
                <div className="switch">
                    {TYPES.map((t,i) => 
                        <button
                            key={i}
                            disabled={(t.key === 'isGuildKick' || t.key  === 'isWhitelist') && version === '1'}
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
        </Modal.Body>
      </Modal>
    );
  }
}

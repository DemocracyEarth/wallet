/* IMPORTS */
// Config
import React, { Component } from "react";
import ApolloClient, { gql, InMemoryCache } from "apollo-boost";
// Components
import { config } from "../../config";
import { defaults } from "lib/const";
import { abiLibrary } from "../../lib/abi";
import SyncLoader from "react-spinners/SyncLoader";
// Forms
import Details from "./Details"
import Applicant from "./Applicant"
import SharesRequested from "./SharesRequested"
import TributeOffered from "./TributeOffered"
import PaymentRequested from "./PaymentRequested"
import MemberToKick from "./MemberToKick"
import TokenToWhitelist from "./TokenToWhitelist"
import "./style.css";
import 'styles/Dapp.css';
// Functions
import { hideProposalLauncher, isAddress, isMember, notNull, submitProposal, submitWhitelistProposal, submitGuildKickProposal, CLEARED_TYPES, CLEARED_NUMBERS} from './utils'
import { noTokens } from './messages'

const molochClient = new ApolloClient({
    uri: config.graph.moloch,
    cache: new InMemoryCache(),
});
const tokensClient = new ApolloClient({
    uri: config.graph.tokens,
    cache: new InMemoryCache(),
});

const TYPES = [
    {key: 'isNewMember', title: 'Member'},
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
    title: {value:"", hasChanged: false},
    description: {value:"", hasChanged: false},
    link: {value:"", hasChanged: false},
};

export default class Proposal extends Component {
    state = { ...INITIAL_STATE };

    // State setting
    setDao = (address) => {
        return molochClient
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
        .then(res => 
            this.setState({
                daoName: res.data.moloches[0].title,
                version: res.data.moloches[0].version,
                availableTokens: res.data.moloches[0].tokens,
                tributeToken: res.data.moloches[0].tokens[0].tokenAddress,
                paymentToken: res.data.moloches[0].tokens[0].tokenAddress,
            })
        )
        .catch(err => console.error('DAOs subgraph not available: ', err));
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
        .then(res => {
            const memo = {}
            this.state.availableTokens.forEach(token => memo[token.tokenAddress] = true)
            this.setState({
                ERC20Tokens: res.data.tokens.filter(token => !memo[token.address])
            })
        })
        .catch(err => {
            console.error('Token Registry subgraph not available: ', err)
        });
    };
    
    setType = (type) => {
        if(this.state[type]) return
        this.setState({
            applicant: {address: this.props.address, validated: true},
            ...CLEARED_NUMBERS,
            ...CLEARED_TYPES,
            [type]: true,
        })
    }

    setDetails = () => {
        this.setState({
            title: {...this.state.title, hasChanged: true},
            description: {...this.state.description, hasChanged: true},
            link: {...this.state.link, hasChanged: true}
        })
    }
    
    resetForm = (e) => {
        if (e) e.preventDefault();
        this.setState({
            isLoading: false,
            applicant: {address: this.props.address, validated: true},
            ...CLEARED_NUMBERS,
            tributeToken: this.state.availableTokens[0].tokenAddress,
            paymentToken: this.state.availableTokens[0].tokenAddress,
            tokenToWhitelist: defaults.EMPTY,
            memberToKick: {address: defaults.EMPTY, validated: false},
            title: {value:"", hasChanged: false},
            description: {value:"", hasChanged: false},
            link: {value:"", hasChanged: false}, 
        });
    };

    // Handlers
    handleSubmitProposal = async (e) => {
        e.preventDefault();
        this.setDetails()
        const { version, applicant, sharesRequested, lootRequested, tributeOffered,tributeToken, paymentRequested, paymentToken, title, description, link } = this.state;
        const { accountAddress, address } = this.props;
        
        // validations
        if(!notNull(title.value, description.value, link.value)) return
        if(!applicant.validated) return

        this.setState({ isLoading: true });

        await submitProposal(/*Wallet information*/ accountAddress, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ applicant.address, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested,paymentToken, /* Details JSON */ { title: title.value, description: description.value, link: link.value });

        hideProposalLauncher();
    };

    handleSubmitWhitelistProposal = async (e) => {
        e.preventDefault();
        this.setDetails()
        const { version, title, description, link, tokenToWhitelist } = this.state;
        const { accountAddress, address } = this.props;
        
        // validations
        if(!notNull(title.value, description.value, link.value, tokenToWhitelist)) return
        
        this.setState({ isLoading: true });

        await submitWhitelistProposal(/*Wallet information*/ accountAddress, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ tokenToWhitelist, /* Details JSON */ { title: title.value, description: description.value, link: link.value });

        hideProposalLauncher();
    };

    handleSubmitGuildKickProposal = async (e) => {
        e.preventDefault();
        this.setDetails()
        const { version, title, description, link, memberToKick } = this.state;
        const { accountAddress, address } = this.props;
    
        // validations
        if(!notNull(title.value, description.value, link.value)) return
        if(!memberToKick.validated) return
        
        this.setState({ isLoading: true });

        await submitGuildKickProposal(/*Wallet information*/ accountAddress, /*Contract information*/ abiLibrary, version, address, /*Proposal information*/ memberToKick.address, /* Details JSON */ { title: title.value, description: description.value, link: link.value });

        hideProposalLauncher();
    };

    handleChanges = async(e) => {
        const name = e.target.name
        let value = e.target.value
        let validated
        if (name === 'applicant') {
            validated = await isAddress(value) 
            value = {address: value, validated} 
        } else if (name === 'memberToKick') {
            validated = await isMember(value, abiLibrary, this.state.version, this.props.address)
            value = {address: value, validated} 
        } else if (name === "title" || name === "description" || name === "link") {
            value = {value, hasChanged: true}
        } else {
            value = e.target.type === "number" && (e.target.value < 0 || e.target.value === '') ? 0 : value
        }
        this.setState({[name]: value})
    }

    componentDidMount() {
        this.setDao(this.props.address)
            .then(() => this.state.version === '2' && this.setTokens())
        this.setState({ applicant: { address: this.props.accountAddress, validated: true } });
    }

    render() {
        const { isNewMember, isFunding, isTrade, isGuildKick, isWhitelist, header, version, availableTokens, ERC20Tokens, applicant, sharesRequested, lootRequested,tributeOffered, tributeToken, paymentRequested, paymentToken, tokenToWhitelist, memberToKick, title, description, link } = this.state

        return (
            (this.props.visible ?
            <div className="modal">
                <div className="container">
                    <div className="header">
                    {this.state.daoName 
                        ? <div className="dao">
                            <img src="/static/media/flag.44f0a516.svg" alt="flag"/>
                              <h4 onClick={()=>hideProposalLauncher()}>{this.state.daoName}</h4>
                          </div>
                        : <div className="option-placeholder identity-placeholder daoPreloader" />
                        }
                    <img onClick={()=>hideProposalLauncher()} src="/static/media/rejected.973d249d.svg" alt="close"></img>
                    </div>
                    <div className="formContainer">
                    {this.state.daoName 
                     ?<>
                        <div className="title">
                            <h2>{`New ${header} Proposal`}<span>{` (v${version})`}</span></h2>
                        </div>
                        <div className="switch">
                            {TYPES.map((t,i) => 
                                <button
                                    key={i}
                                    disabled={(t.key === 'isGuildKick' || t.key  === 'isWhitelist') && version === '1'}
                                    className={`switchButton ${this.state[t.key] ? 'switched' : null}`}
                                    onClick={() => t.key === 'isWhitelist' && !ERC20Tokens[0] ? noTokens() : this.setType(t.key)}
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
                                <button className="submit clear" onClick={this.resetForm}>
                                    Clear
                                </button>
                                {this.state.isLoading ? (
                                    <SyncLoader
                                    size={8}
                                    margin={2}
                                    color={'var(--menu-sidebar-selected)'}
                                    loading={true}
                                  />
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
                      </>
                     :<> 
                        <div className="option-proposal formPreloader">
                                <div className="option-title option-link option-search title-input">
                                    <div className="title-input title-feed">
                                        <div className="option-placeholder" />
                                        <div className="option-placeholder" />
                                        <div className="option-placeholder fifty" />
                                    </div>
                                </div>
                        </div>
                     </>}
                    </div>
                </div>
            </div>
            :
            null
            )
        );
    }
}

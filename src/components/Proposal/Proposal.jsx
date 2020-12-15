/* IMPORTS */
// Config
import React, { Component } from "react";
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
// Components
import { config } from '../../config'
import { defaults } from 'lib/const';
import { abiLibrary } from '../../lib/abi'
import { Modal } from 'react-bootstrap'
import { Loader } from 'rimble-ui';
import './modalStyle.css'
// Functions
import { walletError, notMember, invalidAddress } from 'components/Choice/messages';

const Web3 = require('web3')
const client = new ApolloClient({
    uri: config.graph.moloch,
    cache: new InMemoryCache(),
});

const INITIAL_STATE = {
    isLoading: false,
    /* Contract information */
    daoName: '',
    version: '', 
    availableTokens: [],
    /* Form inputs */
    applicant: {address: defaults.EMPTY, validated: false},
    sharesRequested: 0,
    lootRequested: 0,
    tributeOffered: 0,
    tributeToken: defaults.EMPTY,
    paymentRequested: 0,
    paymentToken: defaults.EMPTY,
    /* Details to compose */
    title: '',
    description:'',
    link:'',
};

const canSubmit = async (
    /*Wallet information*/
    user,
    /*Contract information*/
    library, version, contractAddress
) => {
    const web3 = new Web3("ws://localhost:8545")
    const dao = await new web3.eth.Contract(library[version === '2' ? 'moloch2' : 'moloch'], contractAddress)
    const response = await dao.methods.members(web3.utils.toChecksumAddress(user))
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
    library, version, address,
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
    const web3 = new Web3("ws://localhost:8545")
    const dao = await new web3.eth.Contract(library[version === '2' ? 'moloch2' : 'moloch'], address)
    
    // EN QUE TIPO DE PROPUESTA DEBEMOS CHEQUEAR EL APPLICANT
    // no applicant address 
    if (!web3.utils.isAddress(applicant)) {
        return invalidAddress();
    }
    // dao membership
    if (version === '1' && !await canSubmit(user, library, version, address)) {
        return notMember();
    }

    //balance vs token

    console.log('LO METOS, CHAMP: ', dao.methods)


    const proposal = version === '2' 
    ? await dao.methods.submitProposal(
        applicantAddress,
        sharesRequested,
        lootRequested,
        tributeOffered,
        tributeToken,
        paymentRequested,
        paymentToken,
        details
    )
    : await dao.methods.submitProposal(
        applicantAddress,
        tributeToken,
        sharesRequested,
        `{"title":${details.title},"description":${details.description},"link":${details.link}}`
    )

    const estimatedGas = await proposal.estimateGas().then(price => price);
    console.log('EL GAS, PA: ', estimatedGas)
    
    const response = await proposal.send({from: user, gas: estimatedGas})
        .on("error", error => console.log('ERROR: ', error))
        .on("confirmation", confirmation => console.log('CONFIRMATION: ', confirmation))
        .on("transactionHash", hash => console.log('HASH: ', hash))
        .on("receipt", receipt => {
            console.log("RECEIPT: ", receipt)
            return receipt
        })
        console.log('LA RISPONS, REY: ', response)
    return response
}

export default class Proposal extends Component {
    state = { ... INITIAL_STATE}

    resetState = (e) => {
        if (e) e.preventDefault()
        this.setState({
            isLoading: false,
            applicant: {address: this.props.user, validated: true},
            sharesRequested: 0,
            lootRequested: 0,
            tributeOffered: 0,
            tributeToken: defaults.EMPTY,
            paymentRequested: 0,
            paymentToken: defaults.EMPTY,
            title: '',
            description:'',
            link:'',
        })
    }

    setDao = (address) => {
        client.query({
            query: gql `{
                 moloches(
                   where: {id: "${address}"}) {
                  title
                 version
                 tokens{
                   tokenAddress
                   symbol
                 }
               }
             }`
        }).then(res => this.setState({
            daoName: res.data.moloches[0].title,
            version: res.data.moloches[0].version,
            availableTokens: res.data.moloches[0].tokens
        }))
    }
    
    handleAddresses = (e) => {

        if (!web3.utils.isAddress(applicant)) {
            return invalidAddress();
        }
    }

    handleChanges = (e) => {
        const value = (e.target.name === 'tributeOffered' || e.target.name === 'paymentRequested' || e.target.name === 'sharesRequested' || e.target.name === 'lootRequested') && e.target.value < 0 
            ? 0
            : e.target.value
        this.setState({[e.target.name]: value})
    }

    handleSubmit = async (e) => {
        e.preventDefault()
        
        const { version, applicant, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, title, description, link } = this.state
        const {user, address} = this.props
        
        if(tributeToken === "0x0" || paymentToken === "0x0") return
        
        this.setState({isLoading: true})
        
        const receipt = await submitProposal(
            /*Wallet information*/
            user,
            /*Contract information*/
            abiLibrary, version, address,
            /*Proposal information*/
            applicant.address, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, 
            /* Details JSON */
            {title, description, link}
        )
        
        this.resetState()
        this.props.onHide()
    }

    componentDidMount(){
        this.setDao(this.props.address)
        this.setState({applicant: {address: this.props.user, validated: true})
    }

    componentDidUpdate(prevProps){
        if(prevProps.address !== this.props.address) this.setDao(this.props.address)
        if(prevProps.user !== this.props.user) this.setState({applicant: {address: this.props.user, validated: true})
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Body className="modal">
                    <div className="container">
                        <div className="header">
                            <img src='/static/media/flag.44f0a516.svg'/>
                            <h4>{this.state.daoName}</h4>
                        </div>
                        <div className="title">
                            <h2>New Proposal</h2>
                        </div>
                        <form action="" className="form">
                            <div className="section">
                                <label className="sectionLabel">Applicant</label>
                                <input
                                    className="input"
                                    type="text"
                                    name="applicant"
                                    value={this.state.applicant.address}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label className="sectionLabel">Title</label>
                                <input
                                    className="input"
                                    type="text"
                                    name="title"
                                    value={this.state.title}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label className="sectionLabel">Description</label>
                                <textarea 
                                    className="input"
                                    type="text textarea"
                                    name="description"
                                    value={this.state.description}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label className="sectionLabel">Link</label>
                                <input 
                                    className="input"
                                    type="text"
                                    name="link"
                                    value={this.state.link}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className='requestsContainer'>
                                <div className="section requests">
                                    <label className="sectionLabel">Shares requested</label>
                                    <input 
                                        className="input"
                                        type="number"
                                        name="sharesRequested"
                                        value={this.state.sharesRequested}
                                        onChange={this.handleChanges}
                                    />
                                </div>
                                <div className="section requests">
                                    <label className="sectionLabel">Loot requested</label>
                                    <input 
                                        className="input"
                                        type="number"
                                        name="lootRequested"
                                        value={this.state.lootRequested}
                                        onChange={this.handleChanges}
                                    />
                                </div>
                            </div>                
                            <div className="section">
                            <label className={this.state.tributeToken === "0x0" ?"sectionLabel emptyAddress" : "sectionLabel"}>Tribute offered</label>
                                <select
                                    className="input"
                                    name="tributeToken"
                                    placeholder=" Tribute token"
                                    value={this.state.tributeToken}
                                    onChange={this.handleChanges}
                                >
                                    <option value={defaults.EMPTY} disabled>Select tribute token</option>
                                    {this.state.availableTokens.map((t, i) => <option key={i} value={t.tokenAddress}>{t.symbol}</option>)}
                                </select>
                                <input
                                    className="input number"
                                    type="number"
                                    name="tributeOffered"
                                    placeholder=" Tribute offered"
                                    value={this.state.tributeOffered}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                            <label className={this.state.paymentToken === "0x0" ?"sectionLabel emptyAddress" : "sectionLabel"}>Payment requested</label>
                                <select
                                    className="input"
                                    name="paymentToken"
                                    placeholder=" Tribute token"
                                    value={this.state.paymentToken}
                                    onChange={this.handleChanges}
                                >
                                    <option value={defaults.EMPTY} disabled>Select payment token</option>
                                    {this.state.availableTokens.map((t,i) => <option key={i} value={t.tokenAddress}>{t.symbol}</option>)}
                                </select>
                                <input
                                    className="input number"
                                    type="number"
                                    name="paymentRequested"
                                    placeholder="Payment requested"
                                    value={this.state.paymentRequested}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section end">
                                <button className="submit clear" onClick={this.resetState}>Clear</button>
                                {this.state.isLoading
                                ? <Loader size="30px" />
                                : <button disabled={false} className="submit" onClick={this.handleSubmit}>Submit proposal</button>}
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}


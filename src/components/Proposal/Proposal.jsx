/* IMPORTS */
// Config
import React, { Component } from "react";
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
// Components
import { defaults } from 'lib/const';
import { abiLibrary } from '../../lib/abi'
import { config } from '../../config'
import { Modal } from 'react-bootstrap'
import { Loader } from 'rimble-ui';
import './modalStyle.css'

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
    applicant: defaults.EMPTY,
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

const submitProposal = async (
    /*Wallet information*/
    user, 
    /*Contract information*/
    library, version, address,
    /*Proposal information*/
    applicant, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, details
) => {    
    const web3 = new Web3("ws://localhost:8545")
    const daoContract = await new web3.eth.Contract(library[version === '2' ? 'moloch2' : 'moloch'], address)
    
    const proposal = version === '2' 
    ? await daoContract.methods.submitProposal(
        applicant,
        sharesRequested,
        lootRequested,
        tributeOffered,
        tributeToken,
        paymentRequested,
        paymentToken,
        details
    )
    : await daoContract.methods.submitProposal(
        applicant,
        tributeToken,
        sharesRequested,
        `{"title":${details.title},"description":${details.description},"link":${details.link}}`
    )

    const estimatedGas = await proposal.estimateGas().then(price => price);
    
    return proposal
    .send({from: user, gas: estimatedGas})
    .on("error", error => console.log('ERROR: ', error))
    .on("confirmation", confirmation => console.log('CONFIRMATION: ', confirmation))
    .on("transactionHash", hash => console.log('HASH: ', hash))
    .on("receipt", receipt => {
        console.log("RECEIPT: ", receipt)
        return receipt
    })
}

export default class Proposal extends Component {
    state = { ... INITIAL_STATE}

    resetState = () => {
        this.setState({
            isLoading: false,
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
    
    handleChanges = (e) => {
        const value = (e.target.name === 'tributeOffered' || e.target.name === 'paymentRequested' || e.target.name === 'sharesRequested' || e.target.name === 'lootRequested') && e.target.value < 0 
            ? 0
            : e.target.value
        this.setState({[e.target.name]: value})
    }

    handleSubmit = async (e) => {
        e.preventDefault()
        this.setState({isLoading: true})

        const { version, applicant, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, title, description, link } = this.state
        const {user, address} = this.props

        const receipt = await submitProposal(
            /*Wallet information*/
            user,
            /*Contract information*/
            abiLibrary, version, address,
            /*Proposal information*/
            applicant, sharesRequested, lootRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, 
            /* Details JSON */
            {title, description, link}
        )
        
        this.resetState()
        this.props.onHide()
    }

    componentDidMount(){
        this.setDao(this.props.address)
        this.setState({applicant: this.props.user})
    }

    componentDidUpdate(prevProps){
        if(prevProps.address !== this.props.address) this.setDao(this.props.address)
        if(prevProps.user !== this.props.user) this.setState({applicant: this.props.user})
    }

    render() {
        return (
            <Modal { ... this.props } size = "lg" aria-labelledby = "contained-modal-title-vcenter" centered>
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
                                <label>Applicant</label>
                                <input
                                    className="input"
                                    type="text"
                                    name="applicant"
                                    value={this.state.applicant}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label>Title</label>
                                <input
                                    className="input"
                                    type="text"
                                    name="title"
                                    value={this.state.title}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label>Description</label>
                                <textarea 
                                    className="input"
                                    type="text textarea"
                                    name="description"
                                    value={this.state.description}
                                    onChange={this.handleChanges}
                                />
                            </div>
                            <div className="section">
                                <label>Link</label>
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
                                    <label>Shares requested</label>
                                    <input 
                                        className="input"
                                        type="number"
                                        name="sharesRequested"
                                        value={this.state.sharesRequested}
                                        onChange={this.handleChanges}
                                    />
                                </div>
                                <div className="section requests">
                                    <label>Loot requested</label>
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
                            <label>Tribute offered</label>
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
                            <label>Payment requested</label>
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
                                {this.state.isLoading
                                ? <Loader size="30px" />
                                :<div className="submit" onClick={this.handleSubmit}>
                                    <button>Submit proposal</button>
                                </div>}
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}


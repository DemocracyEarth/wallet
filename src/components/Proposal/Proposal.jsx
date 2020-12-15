/* IMPORTS */
// Config
import React, { Component } from "react";
import ApolloClient, { gql, InMemoryCache } from "apollo-boost";
// Components
import { defaults } from "lib/const";
import { abiLibrary } from "../../lib/abi";
import { config } from "../../config";
import { Modal } from "react-bootstrap";
import "./modalStyle.css";
import Switch from "react-input-switch";

// Proposals
import WhitelistProposal from "./WhitelistProposal";
import SubmitProposal from "./SubmitProposal";
import GuildKickProposal from "./GuildKickProposal";

const Web3 = require("web3");
const client1 = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});
const client2 = new ApolloClient({
  uri: config.graph.tokens,
  cache: new InMemoryCache(),
});

const INITIAL_STATE = {
  isLoading: false,
  whitelist: "No",
  guildkick: "No",
  /* Contract information */
  daoName: "",
  version: "",
  availableTokens: [],
  allTokens: [],
  /* Form inputs */
  applicant: defaults.EMPTY,
  sharesRequested: 0,
  lootRequested: 0,
  tributeOffered: 0,
  tributeToken: defaults.EMPTY,
  paymentRequested: 0,
  paymentToken: defaults.EMPTY,
  memberToKick: "",
  /* Details to compose */
  title: "",
  description: "",
  link: "",
};

const submitWhitelist = async (
  /*Wallet information*/
  user,
  /*Contract information*/
  library,
  version,
  address,
  /*Proposal information*/
  paymentToken,
  details
) => {
  const web3 = new Web3("ws://localhost:8545");
  const daoContract = await new web3.eth.Contract(
    library[version === "2" ? "moloch2" : "moloch"],
    address
  );
  console.log("daoContract: ", daoContract);
  const proposal = await daoContract.methods.submitWhitelistProposal(
    paymentToken,
    details
  );
  const estimatedGas = await proposal.estimateGas().then((price) => price);

  return proposal
    .send({ from: user, gas: estimatedGas })
    .on("error", (error) => console.log("ERROR: ", error))
    .on("confirmation", (confirmation) => console.log("CONFIRMATION: ", confirmation))
    .on("transactionHash", (hash) => console.log("HASH: ", hash))
    .on("receipt", (receipt) => {
      console.log("RECEIPT: ", receipt);
      return receipt;
    });
};

const submitKickProposal = async (
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
  console.log("daoContract: ", daoContract);
  const proposal = await daoContract.methods.submitGuildKickProposal(memberToKick, details);
  const estimatedGas = await proposal.estimateGas().then((price) => price);

  return proposal
    .send({ from: user, gas: estimatedGas })
    .on("error", (error) => console.log("ERROR: ", error))
    .on("confirmation", (confirmation) => console.log("CONFIRMATION: ", confirmation))
    .on("transactionHash", (hash) => console.log("HASH: ", hash))
    .on("receipt", (receipt) => {
      console.log("RECEIPT: ", receipt);
      return receipt;
    });
};

const submitProposal = async (
  /*Wallet information*/
  user,
  /*Contract information*/
  library,
  version,
  address,
  /*Proposal information*/
  applicant,
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
  console.log("daoContract: ", daoContract);

  const proposal =
    version === "2"
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
        );

  const estimatedGas = await proposal.estimateGas().then((price) => price);

  return proposal
    .send({ from: user, gas: estimatedGas })
    .on("error", (error) => console.log("ERROR: ", error))
    .on("confirmation", (confirmation) => console.log("CONFIRMATION: ", confirmation))
    .on("transactionHash", (hash) => console.log("HASH: ", hash))
    .on("receipt", (receipt) => {
      console.log("RECEIPT: ", receipt);
      return receipt;
    });
};

export default class Proposal extends Component {
  state = { ...INITIAL_STATE };

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
      title: "",
      description: "",
      link: "",
    });
  };

  setDao = (address) => {
    client1
      .query({
        query: gql`{
                 moloches(
                   where: {id: "${address}"}) {
                  title
                 version
                 tokens{
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
        })
      );
  };

  setTokens = () => {
    client2
      .query({
        query: gql`
          {
            tokens {
              address
              name
              symbol
            }
          }
        `,
      })
      .then((res) =>
        this.setState({
          allTokens: res.data.tokens.filter((token) => {
            return token != this.state.allTokens;
          }),
        })
      );
  };

  handleChanges = (e) => {
    const value =
      (e.target.name === "tributeOffered" ||
        e.target.name === "paymentRequested" ||
        e.target.name === "sharesRequested" ||
        e.target.name === "lootRequested") &&
      e.target.value < 0
        ? 0
        : e.target.value;
    this.setState({ [e.target.name]: value });
  };

  handleSubmitKickProposal = async (e) => {
    e.preventDefault();
    this.setState({ isLoading: true });

    const { version, title, description, link, memberToKick } = this.state;
    const { user, address } = this.props;

    const receipt = await submitKickProposal(
      /*Wallet information*/
      user,
      /*Contract information*/
      abiLibrary,
      version,
      address,
      /* Details JSON */
      memberToKick,
      { title, description, link }
    );

    this.resetState();
    this.props.onHide();
  };

  handleSubmitWhitelist = async (e) => {
    e.preventDefault();
    this.setState({ isLoading: true });

    const { version, paymentToken, title, description, link } = this.state;
    const { user, address } = this.props;

    const receipt = await submitWhitelist(
      /*Wallet information*/
      user,
      /*Contract information*/
      abiLibrary,
      version,
      address,
      /*Proposal information*/
      paymentToken,
      /* Details JSON */
      { title, description, link }
    );

    this.resetState();
    this.props.onHide();
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isLoading: true });

    const {
      version,
      applicant,
      sharesRequested,
      lootRequested,
      tributeOffered,
      tributeToken,
      paymentRequested,
      paymentToken,
      title,
      description,
      link,
    } = this.state;
    const { user, address } = this.props;

    const receipt = await submitProposal(
      /*Wallet information*/
      user,
      /*Contract information*/
      abiLibrary,
      version,
      address,
      /*Proposal information*/
      applicant,
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

  handleCheck = (checked) => {
    this.setState({ checked });
  };

  componentDidMount() {
    this.setDao(this.props.address);
    this.setState({ applicant: this.props.user });
    this.setTokens();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.address !== this.props.address) this.setDao(this.props.address);
    if (prevProps.user !== this.props.user) this.setState({ applicant: this.props.user });
    if (prevProps.allTokens !== this.props.allTokens) this.setTokens();
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body className="modal">
          <div className="container">
            <div className="header">
              <img src="/static/media/flag.44f0a516.svg" />
              <h4>{this.state.daoName}</h4>
            </div>
            <div className="title">
              <h2>New Proposal</h2>
            </div>

            <div className="switch">
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
              />
            ) : null}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

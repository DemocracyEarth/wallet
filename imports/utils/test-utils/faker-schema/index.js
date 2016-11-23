import jsf from 'json-schema-faker'
import { Ballot } from './Ballot'
import {
  Country,
  Jurisdiction,
  CollectiveProfile,
  Collective
} from './Collective'
import { Contract } from './Contract'
import { Thread } from './Thread'
import { Transaction } from './Transaction'
import { Wallet } from './Wallet'
import { Credential, Menu, Profile, User } from './User'
import { Tag } from './Tag'
import { DelegationContract, Delegation, Vote } from './Vote'

export const fakerSchema = {
  generateDoc: jsf,
  schema: {
    Ballot,
    Country,
    Jurisdiction,
    CollectiveProfile,
    Collective,
    Contract,
    Thread,
    Transaction,
    Wallet,
    Credential,
    Menu,
    Profile,
    User,
    Tag,
    DelegationContract,
    Delegation,
    Vote
  }
}

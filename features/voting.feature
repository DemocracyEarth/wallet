Feature: Voting on ideas
  In order to exercise my sovereignty
  As a citizen
  I need to be able to vote on ideas


  Scenario: Receive a thousand votes upon account creation
    Given I am the newly created citizen named N00B
     Then I should have 1000 votes available

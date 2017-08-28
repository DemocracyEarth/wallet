Feature: Voting on ideas
  In order to exercise my sovereignty
  As a citizen
  I need to be able to vote on ideas


  Scenario: Receive a thousand votes upon account creation
    Given I am the newly created citizen named N00B
     Then I should have 1000 votes available


  Scenario: Vote for someone else's idea
    Given I am the citizen named Ali
      And there is a citizen named Bob
      And Bob has proposed a votable idea titled "Bob's Idea"
      And Ali has proposed an idea titled "Ali's Idea"
     Then there should be an idea titled "Ali's Idea"
     Then there should be an idea titled "Bob's Idea"
     When I go to the homepage
     Then I should see "Bob's Idea" in the feed
     When I click on "Bob's Idea" in the feed
     Then I should be on the page /vote/bobs-idea
     When I click on the Yes ballot option
     #And I commit 10 votes to the idea


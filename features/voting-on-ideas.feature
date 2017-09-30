Feature: Voting on ideas
  In order to exercise my sovereignty
  As a citizen
  I need to be able to vote on ideas


  Background:
    Given I am the citizen named Ali
      And there is a citizen named Bob
      And Bob has proposed a votable idea titled "Bob's Idea"


  Scenario: Find people's ideas in the homepage feed
     Then there should be an idea titled "Bob's Idea"
     When I go to the homepage
     Then I should see "Bob's Idea" in the feed
     When I click on "Bob's Idea" in the feed
     Then I should be on the detail page of the idea titled "Bob's Idea"


  # From what we gather, the initial received votes count will not be constant over time…
  # https://github.com/DemocracyEarth/paper#332-equality
  # How to (sanely) express it as Scenarios ?
  Scenario: Receive a thousand votes upon account creation
    Given I am the newly created citizen named N00B
     Then I should have a thousand votes available


# The step "I commit (\d+) votes to the idea" will refresh the page afterwards
# because it's a hack that leaves the page in a somewhat invalid state. Help welcomed.
# It also automatically confirms the choice in the modal that opens.


  Scenario: Vote in favor of someone else's idea
     When I go to the homepage
      And I click on "Bob's Idea" in the feed
     When I select the Yes ballot option
      And I commit 200 votes to the idea
     Then I should have 800 votes available


  Scenario: Vote against someone else's idea
     When I go to the homepage
     When I click on "Bob's Idea" in the feed
     When I select the No ballot option
      And I commit all my votes to the idea
     Then I should have 0 votes available


  Scenario: Change my mind about someone else's idea
     When I go to the homepage
     When I click on "Bob's Idea" in the feed
     When I wrongly select the No ballot option
      And I commit 10 votes to the idea
     Then I should have 990 votes available
      But I realize my mistake
      And I select the Yes ballot option
      And I confirm my choice
     Then I should have 990 votes available
      And I commit 20 votes to the idea
     Then I should have 980 votes available


  Scenario: Vote in favor of my own idea
  Scenario: Vote against my own idea /!\

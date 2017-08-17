Feature: Proposing ideas
  In order to share knowledge and initiate legal updates
  As a citizen
  I need to be able to propose ideas

  Background:
    Given I am the citizen named Richard S.
#      And Richard S. has 42 votes available
      And there is a tag titled Transparency
      And there is a tag titled Sovereignty

  Scenario: Propose a fully qualified idea successfully
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
     When I am on the homepage
      And I trigger the floating action button
     Then I should be on the page to propose an idea
     When I set the idea title to "Require libre software in all governmental endeavours."
      And I set the idea description to "Trusting closed software is a loss of sovereignty."
      And I add the tag Transparency
      And I add the tag Sovereignty
      And I enable ballot voting
      And I submit the idea
     Then there should be an idea titled "Require libre software in all governmental endeavours."

#      And ...

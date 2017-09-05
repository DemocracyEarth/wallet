Feature: Authoring ideas
  In order to share knowledge and initiate legal updates
  As a citizen
  I need to be able to author and publish ideas

  Background:
    Given I am the citizen named Richard S.
      And there is a tag titled Transparency
      And there is a tag titled Sovereignty

  Scenario: Propose a fully qualified idea successfully
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
      And I am on the homepage
     When I trigger the floating action button
     Then I should be on the page to propose an idea
     When I set the idea title to "Require libre software in all governmental endeavours."
      And I set the idea description to "Trusting closed software is a loss of sovereignty."
      And I add the tag Transparency
      And I add the tag Sovereignty
      And I enable ballot voting
      And I submit the idea
     Then there should be an idea titled "Require libre software in all governmental endeavours."

  Scenario: Propose an idea without ballot voting
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
      And I am on the homepage
     When I trigger the floating action button
     Then I should be on the page to propose an idea
     When I set the idea title to "Require libre software in all governmental endeavours."
      And I set the idea description to "Trusting closed software is a loss of sovereignty."
      And I add the tag Transparency
      And I add the tag Sovereignty
      And I submit the idea
     Then there should be an idea titled "Require libre software in all governmental endeavours."

  # possible additional scenarios
  Scenario: Fail to propose an idea without title
  Scenario: Fail to propose an idea with a title too short

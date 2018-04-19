@watch
Feature: Authoring ideas
  In order to share knowledge and initiate legal updates
  As a citizen
  I need to be able to author and publish ideas

  Background:
    Given I am a registered citizen with name Richard S.
      And there is a tag titled Transparency
      And there is a tag titled Sovereignty

  # See https://github.com/DemocracyEarth/sovereign/pull/220#issuecomment-378731546
  Scenario: Create an idea draft upon user creation
     Then there should be one idea draft in the database


  Scenario: Propose an idea successfully
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
      And I am on the homepage
     When I trigger the floating action button
        # Ideally, we should wait for the input field instead of waiting for a fixed duration
#     Then I should be focused on the input field of a new idea (?)
      And I wait for 1 second
      And I type "Require libre software in all governmental endeavours."
        # Here, if we do not wait, an idea without title is submitted.
        # Not sure what this issue is about nor how to solve it. Help?
      And I wait for 1 second
      And I submit the idea
      And I wait for 2 seconds
     #And I dump all the ideas
     Then there should be one idea in the database
      And there should be an idea titled "Require libre software in all governmental endeavours."


  Scenario: Propose an idea with ballot voting
    Given there should not be an idea titled "Require libre software in all governmental endeavours."
      And I am on the homepage
     When I trigger the floating action button
        # Ideally, we should wait for the input field instead of waiting for a fixed duration
    #Then I should be focused on the input field of a new idea (?)
      And I wait for 1 second
      And I type "Require libre software in all governmental endeavours."
        # Here, if we do not wait, an idea without title is submitted.
        # Not sure what this issue is about nor how to solve it. Help?
      And I wait for 1 second
      And I enable ballot voting
      And I submit the idea
      And I wait for 2 seconds
     #And I dump all the ideas
     Then there should be one idea in the database
      And there should be an idea titled "Require libre software in all governmental endeavours."


  # possible additional scenarios
  Scenario: Fail to propose an idea without title
  Scenario: Fail to propose an idea with a title too short

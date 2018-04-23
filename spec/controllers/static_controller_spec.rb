require 'rails_helper'
require Rails.root.join(
  'spec', 'controllers', 'shared_examples', 'assigns_title.rb'
)

describe StaticController, type: :controller do
  describe 'GET terms' do
    subject { get :terms}
    it_behaves_like 'assigns title', 'Terms of Service'
  end

  describe 'GET contribute' do
    subject { get :contribute }
    it_behaves_like 'assigns title', 'Contribute data'
  end

  describe 'GET browser_support' do
    subject { get :browser_support }
    it_behaves_like 'assigns title', "Oops, your browser isn't supported."
  end
end

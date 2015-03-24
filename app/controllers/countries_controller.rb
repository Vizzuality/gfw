class CountriesController < ApplicationController
  before_filter :check_terms
  before_action :check_country_iso, only: :show

  skip_before_filter :verify_authenticity_token, only: [:create_download]

  include ActionView::Helpers::NumberHelper
  include CountriesConcern

  layout 'countries'

  def index
    @countries = find_countries
    @title = I18n.translate 'countries.index.title'
  end

  def show

    if @country['gva'].present? && @country['gva'] > 0
      gva_precision = (@country['gva_percent'] < 0.1) ? 2 : 1
      @country['gva_percent'] = number_to_percentage(@country['gva_percent'], precision: gva_precision)
    end

    @employees = @country['employment']
    @conventions = %w(cbd unfccc kyoto unccd itta cites ramsar world_heritage nlbi ilo)

    blog_story = Api::Blog.find_by_country(@country)
    @blog_story = blog_story.present? ? blog_story : nil

    response = Typhoeus.get("https://wri-01.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20mongabaydb%20WHERE%20position('#{@country['name'].downcase}'%20in%20keywords)%20%3C%3E%200", headers: { "Accept" => "application/json" })

    @mongabay_story = if response.success?
                        Rails.cache.fetch 'mongabay_story', expires_in: 1.day do
                          JSON.parse(response.body)['rows'][0]
                        end
                      else
                        nil
                      end
    @title = @country['name']
    @desc = 'Data about forest change, tenure, forest related employment and land use in ' + @title
  end

  def overview
    @title =  I18n.translate 'countries.overview.title'
  end

  def create_download
    if (params[:email].present?)
      MobileDownload.download_email(
        params[:email],
        download_link(params[:id])
      ).deliver

      return render json: true
    end

    return render json: false, status: :unprocessable_entity
  end

  def download
    redirect_to download_link(params[:id])
  end

  private
    def find_countries
      response = Typhoeus.get("#{ENV['GFW_API_HOST']}/countries", headers: {"Accept" => "application/json"})
      if response.success?
        Rails.cache.fetch 'countries', expires_in: 1.day do
          JSON.parse(response.body)['countries']
        end
      else
        nil
      end
    end

    def find_by_iso(iso)
      unless iso.blank?
        Rails.cache.fetch 'country_' + iso, expires_in: 1.day do
          response = Typhoeus.get(
              "#{ENV['GFW_API_HOST']}/countries/#{iso}",
              headers: {"Accept" => "application/json"}
          )
          if response.success?
            JSON.parse(response.body)
          else
            nil
          end
        end
      end
    end
    def find_by_name(country_name)
      country_name, *rest = country_name.split(/_/)
      country_name = country_name.capitalize!
      response = Typhoeus.get("https://wri-01.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20gfw2_countries%20where%20name%20like%20'#{country_name}%25'",
        headers: {"Accept" => "application/json"}
        )
      if response.success?
        JSON.parse(response.body)['rows'][0]
      else
        nil
      end
    end
    def check_country_iso
      @country = find_by_iso(params[:id])
      unless @country.nil?
        @country
      else
        @country = find_by_name(params[:id])
      end
        @country
    end
end

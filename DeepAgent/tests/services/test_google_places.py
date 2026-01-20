"""Comprehensive unit tests for Google Places service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from googlemaps.exceptions import ApiError, HTTPError, Timeout

from src.services.google_places import GooglePlacesService
from src.models.business import Business
from src.utils.config import Config


# Sample mock data matching Google Places API structure
SAMPLE_PLACE_SEARCH_RESULT = {
    'results': [
        {
            'place_id': 'ChIJN1t_tDeuEmsRUsoyG83frY4',
            'name': 'ABC Roofing Company',
            'formatted_address': '123 Main St, Austin, TX 78701, USA',
            'geometry': {
                'location': {'lat': 30.2672, 'lng': -97.7431}
            },
            'rating': 4.5,
            'types': ['roofing_contractor', 'establishment', 'point_of_interest'],
            'business_status': 'OPERATIONAL',
            'price_level': 2
        },
        {
            'place_id': 'ChIJXxXxXxXxXxXxXxXxXxXxXx',
            'name': 'XYZ Roofing Services',
            'formatted_address': '456 Oak Ave, Austin, TX 78702, USA',
            'geometry': {
                'location': {'lat': 30.2680, 'lng': -97.7440}
            },
            'rating': 4.8,
            'types': ['roofing_contractor', 'establishment'],
            'business_status': 'OPERATIONAL',
            'price_level': 3
        }
    ],
    'status': 'OK'
}

SAMPLE_PLACE_DETAILS_1 = {
    'result': {
        'place_id': 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        'name': 'ABC Roofing Company',
        'formatted_address': '123 Main St, Austin, TX 78701, USA',
        'international_phone_number': '+1-512-555-0123',
        'formatted_phone_number': '(512) 555-0123',
        'website': 'https://www.abcroofing.com',
        'rating': 4.5,
        'geometry': {
            'location': {'lat': 30.2672, 'lng': -97.7431}
        },
        'business_status': 'OPERATIONAL',
        'price_level': 2,
        'types': ['roofing_contractor', 'establishment', 'point_of_interest'],
        'reviews': [
            {
                'author_name': 'John Doe',
                'rating': 5,
                'text': 'Great service!',
                'time': 1609459200  # Most recent
            },
            {
                'author_name': 'Jane Smith',
                'rating': 4,
                'text': 'Good work',
                'time': 1609372800
            },
            {
                'author_name': 'Bob Johnson',
                'rating': 5,
                'text': 'Excellent!',
                'time': 1609286400
            },
            {
                'author_name': 'Alice Brown',
                'rating': 4,
                'text': 'Very professional',
                'time': 1609200000
            },
            {
                'author_name': 'Charlie Wilson',
                'rating': 5,
                'text': 'Amazing!',
                'time': 1609113600
            },
            {
                'author_name': 'Diana Lee',
                'rating': 4,
                'text': 'Satisfied customer',
                'time': 1609027200  # Oldest (should be filtered out)
            }
        ]
    }
}

SAMPLE_PLACE_DETAILS_2 = {
    'result': {
        'place_id': 'ChIJXxXxXxXxXxXxXxXxXxXxXx',
        'name': 'XYZ Roofing Services',
        'formatted_address': '456 Oak Ave, Austin, TX 78702, USA',
        'international_phone_number': '+1-512-555-0456',
        'website': 'https://www.xyzroofing.com',
        'rating': 4.8,
        'geometry': {
            'location': {'lat': 30.2680, 'lng': -97.7440}
        },
        'business_status': 'OPERATIONAL',
        'price_level': 3,
        'types': ['roofing_contractor', 'establishment'],
        'reviews': []
    }
}


@pytest.fixture
def mock_config():
    """Create a mock Config object for testing."""
    config = Mock(spec=Config)
    config.google_places_api_key = 'test_api_key'
    config.google_places_max_results = 20
    return config


@pytest.fixture
def mock_config_no_key():
    """Create a mock Config object without API key."""
    config = Mock(spec=Config)
    config.google_places_api_key = None
    config.google_places_max_results = 20
    return config


@pytest.fixture
def mock_googlemaps_client():
    """Create a mock googlemaps.Client."""
    client = Mock()
    return client


class TestServiceInitialization:
    """Test service initialization."""
    
    def test_successful_initialization(self, mock_config):
        """Test successful initialization with valid config."""
        with patch('src.services.google_places.googlemaps.Client') as mock_client_class:
            service = GooglePlacesService(mock_config)
            
            assert service.config == mock_config
            assert service.max_results == 20
            mock_client_class.assert_called_once_with(key='test_api_key')
    
    def test_initialization_without_api_key(self, mock_config_no_key):
        """Test that ValueError is raised when API key is missing."""
        with pytest.raises(ValueError, match="Google Places API key is required"):
            GooglePlacesService(mock_config_no_key)
    
    def test_max_results_set_from_config(self, mock_config):
        """Test that max_results is set from config."""
        mock_config.google_places_max_results = 10
        with patch('src.services.google_places.googlemaps.Client'):
            service = GooglePlacesService(mock_config)
            assert service.max_results == 10


class TestSuccessfulBusinessSearch:
    """Test successful business search scenarios."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_search_businesses_returns_list(self, mock_client_class, mock_config):
        """Test that search_businesses returns a list of Business objects."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = SAMPLE_PLACE_SEARCH_RESULT
        mock_client.place.side_effect = [
            SAMPLE_PLACE_DETAILS_1,
            SAMPLE_PLACE_DETAILS_2
        ]
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):  # Mock sleep to speed up tests
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert isinstance(businesses, list)
        assert len(businesses) == 2
        assert all(isinstance(b, Business) for b in businesses)
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_business_fields_populated_correctly(self, mock_client_class, mock_config):
        """Test that all Business fields are correctly populated."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        business = businesses[0]
        
        # Required fields
        assert business.name == 'ABC Roofing Company'
        assert business.address == '123 Main St, Austin, TX 78701, USA'
        assert business.industry == 'roofing'
        assert business.city == 'Austin'
        assert business.state == 'TX'
        assert business.google_place_id == 'ChIJN1t_tDeuEmsRUsoyG83frY4'
        
        # Optional fields
        assert business.phone == '+1-512-555-0123'
        assert business.website_url == 'https://www.abcroofing.com'
        assert business.rating == 4.5
        assert business.latitude == 30.2672
        assert business.longitude == -97.7431
        assert business.business_status == 'OPERATIONAL'
        assert business.price_level == 2
        assert business.has_website == False  # Set by Website Detection Agent later


class TestMissingOptionalFields:
    """Test handling of missing optional fields."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_missing_phone_and_website(self, mock_client_class, mock_config):
        """Test business creation with missing phone and website."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [{
                'place_id': 'test_id',
                'name': 'Test Business',
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}},
                'rating': 4.0
            }]
        }
        mock_client.place.return_value = {
            'result': {
                'place_id': 'test_id',
                'name': 'Test Business',
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}},
                'rating': 4.0
                # No phone or website
            }
        }
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        assert businesses[0].phone is None
        assert businesses[0].website_url is None
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_missing_reviews_and_rating(self, mock_client_class, mock_config):
        """Test business creation with missing reviews and rating."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [{
                'place_id': 'test_id',
                'name': 'Test Business',
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
                # No rating
            }]
        }
        mock_client.place.return_value = {
            'result': {
                'place_id': 'test_id',
                'name': 'Test Business',
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
                # No rating or reviews
            }
        }
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        assert businesses[0].rating is None
        assert businesses[0].reviews == []


class TestRateLimiting:
    """Test rate limiting functionality."""
    
    @patch('src.services.google_places.googlemaps.Client')
    @patch('time.sleep')
    def test_sleep_called_between_calls(self, mock_sleep, mock_client_class, mock_config):
        """Test that sleep is called between Place Details API calls."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [
                SAMPLE_PLACE_SEARCH_RESULT['results'][0],
                SAMPLE_PLACE_SEARCH_RESULT['results'][1]
            ]
        }
        mock_client.place.side_effect = [
            SAMPLE_PLACE_DETAILS_1,
            SAMPLE_PLACE_DETAILS_2
        ]
        
        service = GooglePlacesService(mock_config)
        service.search_businesses("roofing", "Austin", "TX")
        
        # Should sleep once between 2 places (not after the last one)
        assert mock_sleep.call_count == 1
        mock_sleep.assert_called_with(0.15)
    
    @patch('src.services.google_places.googlemaps.Client')
    @patch('time.sleep')
    def test_no_sleep_after_last_place(self, mock_sleep, mock_client_class, mock_config):
        """Test that sleep is NOT called after the last place."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        service.search_businesses("roofing", "Austin", "TX")
        
        # Should not sleep for a single place
        assert mock_sleep.call_count == 0


class TestResultLimiting:
    """Test result limiting functionality."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_max_results_limit(self, mock_client_class, mock_config):
        """Test that only max_results businesses are returned."""
        mock_config.google_places_max_results = 2
        
        # Create 5 places
        many_places = {
            'results': [
                SAMPLE_PLACE_SEARCH_RESULT['results'][0],
                SAMPLE_PLACE_SEARCH_RESULT['results'][1],
                SAMPLE_PLACE_SEARCH_RESULT['results'][0],  # Duplicate for testing
                SAMPLE_PLACE_SEARCH_RESULT['results'][1],
                SAMPLE_PLACE_SEARCH_RESULT['results'][0]
            ]
        }
        
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = many_places
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should only return 2 businesses (max_results)
        assert len(businesses) == 2


class TestEmptySearchResults:
    """Test handling of empty search results."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_empty_results_list(self, mock_client_class, mock_config):
        """Test handling of empty results list."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {'results': [], 'status': 'OK'}
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert businesses == []
        assert isinstance(businesses, list)
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_no_results_key(self, mock_client_class, mock_config):
        """Test handling of response without 'results' key."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {'status': 'ZERO_RESULTS'}
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert businesses == []


class TestAPIErrorHandling:
    """Test API error handling."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_api_error_raised(self, mock_client_class, mock_config):
        """Test that ApiError is logged and re-raised."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.side_effect = ApiError('API Error')
        
        service = GooglePlacesService(mock_config)
        
        with pytest.raises(ApiError):
            service.search_businesses("roofing", "Austin", "TX")
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_http_error_raised(self, mock_client_class, mock_config):
        """Test that HTTPError is logged and re-raised."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        http_error = HTTPError('HTTP Error')
        http_error.status_code = 500  # HTTPError requires status_code
        mock_client.places.side_effect = http_error
        
        service = GooglePlacesService(mock_config)
        
        with pytest.raises(HTTPError):
            service.search_businesses("roofing", "Austin", "TX")
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_timeout_error_raised(self, mock_client_class, mock_config):
        """Test that Timeout is logged and re-raised."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.side_effect = Timeout('Timeout Error')
        
        service = GooglePlacesService(mock_config)
        
        with pytest.raises(Timeout):
            service.search_businesses("roofing", "Austin", "TX")


class TestPlaceDetailsErrorHandling:
    """Test Place Details API error handling."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_place_details_returns_none(self, mock_client_class, mock_config):
        """Test that business is still created when place details fails."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = None  # Simulate API failure
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should still create business from text search data
        assert len(businesses) == 1
        assert businesses[0].name == 'ABC Roofing Company'


class TestRateLimitRetryLogic:
    """Test rate limit retry logic."""
    
    @patch('src.services.google_places.googlemaps.Client')
    @patch('time.sleep')
    def test_rate_limit_retry_succeeds(self, mock_sleep, mock_client_class, mock_config):
        """Test that rate limit retry succeeds."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        
        # First call raises 429, retry succeeds
        rate_limit_error = ApiError('Rate limit exceeded')
        rate_limit_error.status = 429
        mock_client.place.side_effect = [
            rate_limit_error,
            SAMPLE_PLACE_DETAILS_1
        ]
        
        service = GooglePlacesService(mock_config)
        
        businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should retry and succeed
        assert len(businesses) == 1
        # Should sleep for backoff (1.0 second)
        assert mock_sleep.call_count >= 1
        # Check that 1.0 second sleep was called for backoff
        assert any(call[0][0] == 1.0 for call in mock_sleep.call_args_list)
    
    @patch('src.services.google_places.googlemaps.Client')
    @patch('time.sleep')
    def test_rate_limit_retry_fails(self, mock_sleep, mock_client_class, mock_config):
        """Test that rate limit retry failure is handled gracefully."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        
        # Both calls fail with 429
        rate_limit_error = ApiError('Rate limit exceeded')
        rate_limit_error.status = 429
        mock_client.place.side_effect = rate_limit_error
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should still create business from text search data
        assert len(businesses) == 1


class TestInvalidPlaceData:
    """Test handling of invalid place data."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_missing_place_id(self, mock_client_class, mock_config):
        """Test that place without place_id is skipped."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [
                {
                    'name': 'Valid Business',
                    'place_id': 'valid_id',
                    'formatted_address': '123 Test St',
                    'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
                },
                {
                    'name': 'Invalid Business',
                    # Missing place_id
                    'formatted_address': '456 Test St',
                    'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
                }
            ]
        }
        mock_client.place.return_value = {
            'result': {
                'place_id': 'valid_id',
                'name': 'Valid Business',
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
            }
        }
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should only return valid business
        assert len(businesses) == 1
        assert businesses[0].name == 'Valid Business'
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_missing_name(self, mock_client_class, mock_config):
        """Test that place without name is skipped."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [
                {
                    'place_id': 'no_name_id',
                    # Missing name
                    'formatted_address': '123 Test St',
                    'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
                }
            ]
        }
        mock_client.place.return_value = {
            'result': {
                'place_id': 'no_name_id',
                # Missing name
                'formatted_address': '123 Test St',
                'geometry': {'location': {'lat': 30.0, 'lng': -97.0}}
            }
        }
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should skip invalid place
        assert len(businesses) == 0


class TestTypeFiltering:
    """Test type filtering functionality."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_generic_types_filtered(self, mock_client_class, mock_config):
        """Test that generic types are filtered out."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        # Should filter out 'establishment' and 'point_of_interest'
        assert 'establishment' not in businesses[0].types
        assert 'point_of_interest' not in businesses[0].types
        assert 'roofing_contractor' in businesses[0].types


class TestReviewSortingAndLimiting:
    """Test review sorting and limiting."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_reviews_limited_to_5(self, mock_client_class, mock_config):
        """Test that only 5 most recent reviews are included."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        # Should have only 5 reviews (6 were provided)
        assert len(businesses[0].reviews) == 5
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_reviews_sorted_by_time(self, mock_client_class, mock_config):
        """Test that reviews are sorted by time (most recent first)."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [SAMPLE_PLACE_SEARCH_RESULT['results'][0]]
        }
        mock_client.place.return_value = SAMPLE_PLACE_DETAILS_1
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        assert len(businesses) == 1
        reviews = businesses[0].reviews
        
        # Verify reviews are sorted by time (descending)
        for i in range(len(reviews) - 1):
            assert reviews[i]['time'] >= reviews[i + 1]['time']
        
        # Most recent should be first
        assert reviews[0]['time'] == 1609459200  # Most recent


class TestPartialFailureHandling:
    """Test partial failure handling."""
    
    @patch('src.services.google_places.googlemaps.Client')
    def test_one_place_fails_others_succeed(self, mock_client_class, mock_config):
        """Test that one failing place doesn't stop processing of others."""
        mock_client = Mock()
        mock_client_class.return_value = mock_client
        mock_client.places.return_value = {
            'results': [
                SAMPLE_PLACE_SEARCH_RESULT['results'][0],
                SAMPLE_PLACE_SEARCH_RESULT['results'][1]
            ]
        }
        
        # First place details fails, second succeeds
        def place_side_effect(place_id, **kwargs):
            if place_id == 'ChIJN1t_tDeuEmsRUsoyG83frY4':
                raise Exception("Place details error")
            return SAMPLE_PLACE_DETAILS_2
        
        mock_client.place.side_effect = place_side_effect
        
        service = GooglePlacesService(mock_config)
        
        with patch('time.sleep'):
            businesses = service.search_businesses("roofing", "Austin", "TX")
        
        # Should still return both businesses (first from text search, second with details)
        # When place details fails, business is still created from text search data
        assert len(businesses) == 2
        # Verify both businesses are present
        business_names = {b.name for b in businesses}
        assert 'ABC Roofing Company' in business_names
        assert 'XYZ Roofing Services' in business_names

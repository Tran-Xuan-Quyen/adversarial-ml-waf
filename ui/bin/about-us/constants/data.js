const ECG = {
    name: 'ECG',
    subtitle: 'Hệ thống quản lý dữ liệu tim mạch, hỗ trợ theo dõi sức khỏe và tạo cầu nối tương tác hiệu quả giữa bệnh nhân và bác sĩ.',
    subtitle2: 'Dự án quản lý dữ liệu tim mạch',
    welcome: {
        description: 'Dự án ECG nhằm phát triển một hệ thống thông minh giúp thu thập, xử lý và quản lý dữ liệu tim mạch từ bệnh nhân. Hệ thống này hỗ trợ người dùng theo dõi sức khỏe hàng ngày, đồng thời cung cấp cho bác sĩ và phòng khám công cụ hữu ích trong việc quản lý và chẩn đoán. Dữ liệu từ bệnh nhân sẽ được lưu trữ an toàn, bảo mật, đảm bảo tính liên tục và khả năng truy cập cho các chuyên gia y tế khi cần thiết. Ngoài ra, hệ thống còn có sự tương tác giữa bệnh nhân và bác sĩ thông qua các tính năng lập lịch khám trực tuyến và nhắn tin trực tiếp, giúp trao đổi thông tin y tế nhanh chóng, quản lý thời gian hiệu quả, và hỗ trợ điều trị từ xa.',
        list: [
            'Giao diện bắt mắt, dễ sử dụng',
            'Hiển thị dữ liệu trực quan',
            'Bảo mật thông tin',
            'Tương tác giữa bệnh nhân và bác sĩ'
        ]
    },
    services: [
        {
            iconClass: 'flaticon-electrocardiogram',
            name: 'Thu thập và xử lý dữ liệu tim mạch',
            description: 'Dữ liệu được thu thập từ các thiết bị đo đeo tay hoặc đặt gần bệnh nhân và truyền qua Bluetooth về ứng dụng di động, giúp đảm bảo tính chính xác và liên tục.'
        },
        {
            iconClass: 'flaticon-emergency-call',
            name: 'Quản lý, lưu trữ và hiển thị dữ liệu',
            description: 'Dữ liệu được lưu trữ trên hệ thống máy chủ, đảm bảo tính bảo mật và quyền riêng tư cho bệnh nhân. Hệ thống chuyển đổi dữ liệu thành các biểu đồ và bảng trực quan, giúp bác sĩ và bệnh nhân dễ dàng phân tích và theo dõi tình trạng sức khỏe.'
        },
        {
            iconClass: 'flaticon-first-aid-kit',
            name: 'Tương tác giữa bệnh nhân và bác sĩ',
            description: 'Hệ thống hỗ trợ bệnh nhân đặt lịch khám trực tuyến và trao đổi trực tiếp với bác sĩ qua tin nhắn, giúp quản lý thời gian hiệu quả và tạo điều kiện để bác sĩ theo dõi và hỗ trợ bệnh nhân từ xa kịp thời.'
        },
    ],
    process: {
        steps: [
            {
                name: 'Thiết bị',
                description: 'Bệnh nhân đeo thiết bị đo có khả năng thu thập dữ liệu sinh học.'
            },
            {
                name: 'App di động',
                description: 'Thiết bị đo kết nối với ứng dụng qua Bluetooth, dữ liệu được gửi từ thiết bị tới app.'
            },
            {
                name: 'Server',
                description: 'App di động đồng bộ dữ liệu với server, nơi dữ liệu được lưu trữ an toàn và phân tích.'
            },
            {
                name: 'Thiết bị',
                description: 'Bác sĩ hoặc phòng khám có thể truy cập dữ liệu từ máy chủ thông qua ứng dụng web, với giao diện trực quan hiển thị thông tin dưới dạng bảng biểu và đồ thị.'
            },
        ],
        img: 'img/about/1.png'
    },
    functions: [
        {
            name: 'Ứng dụng di động',
            list: [
                'Nhận dữ liệu từ thiết bị đo qua kết nối Bluetooth.',
                'Hiển thị dữ liệu tim mạch cho người dùng trên giao diện trực quan.',
                'Đồng bộ dữ liệu với máy chủ để lưu trữ và phân tích lâu dài.',
                'Cảnh báo và nhắc nhở người dùng trong các trường hợp kết quả tim mạch không ổn định.',
                'Cung cấp giao diện lập lịch hẹn với bác sĩ và tương tác trực tiếp qua nhắn tin.',
            ]
        },
        {
            name: 'Ứng dụng web',
            list: [
                'Dành cho bác sĩ, bệnh viện và bệnh nhân để theo dõi tình trạng sức khỏe.',
                'Hiển thị dữ liệu tim mạch dưới dạng bảng biểu, đồ thị, cung cấp các công cụ phân tích chi tiết.',
                'Quản lý hồ sơ bệnh nhân, bác sĩ và quyền truy cập dữ liệu.',
                'Chức năng báo cáo và xuất dữ liệu cho các nghiên cứu lâm sàng hoặc y tế.',
                'Cung cấp giao diện lập lịch hẹn với bác sĩ và tương tác trực tiếp qua nhắn tin.',
            ]
        }
    ],
    technology: {
        subtitle: 'Hệ thống ECG được phát triển dựa trên các công nghệ hiện đại, đảm bảo hiệu suất và bảo mật cao',
        list: [
            {
                name: 'Ứng dụng di động (app)',
                description: 'Sử dụng Flutter, một framework đa nền tảng, giúp phát triển nhanh chóng cho cả Android và iOS',
                iconImg: [
                    'img/fmECG/flutter.png'
                ]
            },
            {
                name: 'Ứng dụng web (web admin)',
                description: 'Xây dựng trên ReactJS để tạo giao diện người dùng mượt mà và NodeJS cho backend, xử lý các tác vụ liên quan đến dữ liệu và kết nối với máy chủ',
                iconImg: [
                    'img/fmECG/React.webp',
                    'img/fmECG/nodejs.png'
                ]
            },
            {
                name: 'Máy chủ (server)',
                description: 'Server sẽ lưu trữ dữ liệu, xử lý yêu cầu và quản lý dữ liệu từ app và web. Các công nghệ cloud như AWS hoặc Google Cloud có thể được sử dụng để đảm bảo tính sẵn sàng và mở rộng dễ dàng.',
                iconImg: [
                    'img/fmECG/aws.png'
                ]
            },
            {
                name: 'Cơ sở dữ liệu',
                description: 'Sử dụng các hệ quản trị cơ sở dữ liệu như MongoDB hoặc MySQL để lưu trữ hồ sơ bệnh nhân và dữ liệu tim mạch.',
                iconImg: [
                    'img/fmECG/mongodb.png',
                    'img/fmECG/mysql.png'
                ]
            },
        ]
    },
    advice: [
        {
            name: 'Lợi ích với bệnh nhân',
            tabId: 'patient',
            list: [
                'Bệnh nhân có thể dễ dàng theo dõi tình trạng sức khỏe của mình mọi lúc, mọi nơi thông qua app.',
                'Cảnh báo và thông báo kịp thời khi phát hiện vấn đề bất thường về nhịp tim.',
                'Giúp bệnh nhân duy trì liên lạc với bác sĩ trong các tình huống cần thiết thông qua lập lịch khám và nhắn tin.'
            ]
        },
        {
            name: 'Lợi ích với bác sĩ và quản trị viên',
            tabId: 'doctor',
            list: [
                'Cung cấp công cụ theo dõi và quản lý bệnh nhân một cách khoa học và chính xác.',
                'Hỗ trợ đưa ra quyết định lâm sàng nhanh chóng và chính xác thông qua dữ liệu lịch sử của bệnh nhân.',
                'Hệ thống quản lý hồ sơ bệnh nhân dễ dàng, giúp tiết kiệm thời gian và nâng cao hiệu quả công việc.'
            ]
        }
    ]
}

export default ECG
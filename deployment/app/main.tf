terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "syrf-scrapper-dev-data-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "us-east-1"

    dynamodb_table = "scraper-dev-data-terraform-state-locking"
    encrypt        = true
  }

}


resource "aws_ecr_repository" "scraper-runner" {
  name = "scraper-runner"
}

data "aws_ecr_image" "scraper_runner_image" {
  repository_name = "scraper-runner"
  image_tag       = "latest"
}

resource "aws_ecs_cluster" "scraper-runner" {
  name = "scraper-runner" # Naming the cluster
}

resource "aws_cloudwatch_log_group" "scraper_runner_logs" {
  name = "scraper-runner-logs"
}



resource "aws_ecs_task_definition" "georacing-scraper-dev" {
  family                   = "georacing-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "georacing-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/geovoile_modern_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 512
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 512        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "swiftsure-saver-dev" {
  family                   = "swiftsure-saver-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "swiftsure-saver",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/non-automatable/swiftsure_saver.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_ecs_task_definition" "tackTracker-scraper-dev" {
  family                   = "tackTracker-scraper-dev" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "tackTracker-scraper",
      "image": "${aws_ecr_repository.scraper-runner.repository_url}@${data.aws_ecr_image.scraper_runner_image.image_digest}",
      "essential": true,
      "command": ["node","new-scrapers/tacktracker_scraper.js"],

      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/scraper.env",
                   "type": "s3"
               }
           ],

      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.scraper_runner_logs.name}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "workingDirectory": "/home/node/app",
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 2048        # Specifying the memory our container requires
  cpu                      = 1024        # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.scraperTaskExecutionRole.arn
}


resource "aws_security_group" "service_security_group" {
  vpc_id = "vpc-02060b6e63c86da41" # Referencing our syrf VPC
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_iam_role" "devscraperTaskExecutionRole" {
  name               = "dev_scraperTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "devscraperTaskExecutionRole_policy" {
  role       = aws_iam_role.devscraperTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}







